import importlib.util
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
KERNEL_PATH = ROOT / "src" / "math" / "kernel.py"
STUDY_KERNEL_PATH = ROOT / "src" / "math" / "study_kernel.py"

spec = importlib.util.spec_from_file_location("study_math_kernel", KERNEL_PATH)
kernel = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(kernel)
exec(STUDY_KERNEL_PATH.read_text(encoding="utf-8"), kernel.__dict__)


class StudyKernelTests(unittest.TestCase):
    def calculate(self, operation, expression, **kwargs):
        return json.loads(kernel.calculate_json(operation, expression, **kwargs))

    def test_existing_operation_gets_learning_steps(self):
        result = self.calculate("differentiate", "x^3 - 3x")
        self.assertEqual(result["result_text"], "3*x**2 - 3")
        self.assertGreaterEqual(len(result["steps"]), 2)
        self.assertEqual(result["steps"][0]["label"], "Identificar a operação")
        self.assertEqual(result["graph_points"], [])

    def test_analysis_reports_critical_points_and_monotonicity(self):
        result = self.calculate("analyze", "x^3 - 3x")
        labels = {item["label"]: item["text"] for item in result["details"]}
        self.assertEqual(labels["Pontos críticos"], "[-1, 1]")
        self.assertIn("Cresce em", labels)
        self.assertIn("Decresce em", labels)
        self.assertIn("Segunda derivada", labels)
        self.assertTrue(any(point["kind"] == "critical" for point in result["graph_points"]))

    def test_equivalent_answer_accepts_algebraic_equivalence(self):
        self.assertTrue(kernel.answers_equivalent("3*x^2-3", "3*(x^2-1)", "x"))
        self.assertFalse(kernel.answers_equivalent("3*x^2-3", "3*x^2+3", "x"))


if __name__ == "__main__":
    unittest.main()
