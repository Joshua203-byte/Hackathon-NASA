"""Regression checks for numeric fidelity and scientific wording. Assisted by Codex."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("narrator", Path(__file__).with_name("10_narrate.py"))
narrator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(narrator)


class NarrativeTests(unittest.TestCase):
    def test_negative_slope_localization_and_origin(self):
        item = {"verdict": "limitada", "statistics": {"slope_per_decade": -24.86}}
        result = narrator.narrate(item, True)
        self.assertIn("-24,86", result["es"])
        self.assertIn("-24.86", result["en"])
        self.assertIn("Simulated", result["en"])
        self.assertEqual(result["generated_by"], "template")

    def test_incomplete_and_zero_are_distinct(self):
        incomplete = narrator.narrate({"verdict": "incompleta", "statistics": None}, False)
        self.assertNotIn("0", incomplete["es"])
        zero = narrator.narrate({"verdict": "sin_evidencia", "statistics": {"slope_per_decade": 0}}, False)
        self.assertIn("0 mm", zero["en"])

    def test_invalid_claims_or_wrong_magnitude_rejected(self):
        for text in ["12 mm", "+3.5 mm", "ENSO causes the change", "va a llover", "predice lluvia", "95 % de probabilidad"]:
            with self.subTest(text=text), self.assertRaises(ValueError):
                narrator.validate(text, -3.5)


if __name__ == "__main__":
    unittest.main()
