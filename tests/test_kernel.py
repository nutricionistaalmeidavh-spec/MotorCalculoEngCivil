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

    def test_derivative(self):
        result = self.calculate("differentiate", "x^3 - 6x^2 + 9x")
        self.assertEqual(result["result_text"], "3*x**2 - 12*x + 9")

    def test_indefinite_integral(self):
        result = self.calculate("integrate", "x^2")
        self.assertEqual(result["result_text"], "x**3/3 + C")

    def test_classic_limit(self):
        result = self.calculate("limit", "(x^2 - 4)/(x - 2)", target="2")
        self.assertEqual(result["result_text"], "4")

    def test_transcendental_graph_does_not_claim_incomplete_roots(self):
        result = self.calculate("graph", "sin(x)/x")
        self.assertEqual(result["roots"], [])

    def test_equation_solver(self):
        result = self.calculate("solve", "x^2 = 9")
        self.assertEqual(result["result_text"], "[-3, 3]")

    def test_blocks_unsafe_input(self):
        with self.assertRaisesRegex(ValueError, "caracteres não permitidos"):
            kernel.calculate_json("simplify", "__import__('os')")


if __name__ == "__main__":
    unittest.main()
