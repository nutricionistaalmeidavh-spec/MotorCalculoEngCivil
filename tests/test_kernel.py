import importlib.util
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
KERNEL_PATH = ROOT / "src" / "math" / "kernel.py"
spec = importlib.util.spec_from_file_location("math_kernel", KERNEL_PATH)
kernel = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(kernel)


class KernelTests(unittest.TestCase):
    def calculate(self, operation, expression, **kwargs):
        return json.loads(kernel.calculate_json(operation, expression, **kwargs))

    def test_quadratic_roots(self):
        result = self.calculate("roots", "x^2 - 4x + 3")
        self.assertEqual(result["result_text"], "[1, 3]")
        self.assertEqual([root["numeric"] for root in result["roots"]], [1.0, 3.0])

    def test_higher_order_derivative_and_graph_overlay(self):
        result = self.calculate(
            "differentiate",
            "x^4",
            derivative_order=2,
        )
        self.assertEqual(result["result_text"], "12*x**2")
        self.assertEqual(result["graph_overlays"][0]["kind"], "derivative")
        self.assertIn("12", result["graph_overlays"][0]["js"])

    def test_tangent_line(self):
        result = self.calculate(
            "differentiate",
            "x^2",
            tangent_point="2",
        )
        self.assertEqual(result["result_text"], "2*x")
        tangent = next(detail for detail in result["details"] if detail["label"].startswith("Reta tangente"))
        self.assertEqual(tangent["text"], "4*x - 4")
        self.assertTrue(any(overlay["kind"] == "tangent" for overlay in result["graph_overlays"]))

    def test_indefinite_integral(self):
        result = self.calculate("integrate", "x^2")
        self.assertEqual(result["result_text"], "x**3/3 + C")
        self.assertIsNone(result["integral_region"])

    def test_definite_integral_returns_region(self):
        result = self.calculate("integrate", "sin(x)", lower="0", upper="pi")
        self.assertEqual(result["result_text"], "2")
        self.assertEqual(
            result["integral_region"],
            {"lower": 0.0, "upper": float(kernel.sp.pi.evalf(12))},
        )

    def test_classic_limit(self):
        result = self.calculate("limit", "(x^2 - 4)/(x - 2)", target="2")
        self.assertEqual(result["result_text"], "4")
        self.assertEqual([detail["text"] for detail in result["details"]], ["4", "4"])

    def test_bilateral_limit_reports_when_sides_disagree(self):
        result = self.calculate("limit", "1/x", target="0")
        self.assertEqual(result["result_text"], "não existe")
        self.assertEqual([detail["text"] for detail in result["details"]], ["-oo", "oo"])
        self.assertTrue(result["warnings"])

    def test_one_sided_limit(self):
        result = self.calculate("limit", "1/x", target="0", direction="+")
        self.assertEqual(result["result_text"], "oo")

    def test_transcendental_graph_does_not_claim_incomplete_roots(self):
        result = self.calculate("graph", "sin(x)/x")
        self.assertEqual(result["roots"], [])

    def test_equation_solver(self):
        result = self.calculate("solve", "x^2 = 9")
        self.assertEqual(result["result_text"], "[-3, 3]")

    def test_bounds_must_be_constant(self):
        with self.assertRaisesRegex(ValueError, "valor constante"):
            kernel.calculate_json("integrate", "x", lower="x", upper="2")

    def test_blocks_unsafe_input(self):
        with self.assertRaisesRegex(ValueError, "caracteres não permitidos"):
            kernel.calculate_json("simplify", "__import__('os')")


if __name__ == "__main__":
    unittest.main()
