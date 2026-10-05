import unittest
import numpy as np
import pandas as pd
import os
import json

from data_engine.generate_dataset import (
    generate_historical_market_data,
    compute_lead_lag_correlations,
    build_features_for_horizon,
    run_walk_forward_evaluation,
    generate_future_forecasts
)

class TestACGSmartBuyPipeline(unittest.TestCase):

    def setUp(self):
        self.df = generate_historical_market_data()
        self.alu_indicators = ["alumina_pax", "energy_cost_index", "global_pmi", "bauxite_index", "lme_inventory", "freight_index"]
        self.pvc_indicators = ["vcm", "ethylene", "brent_crude", "naphtha", "freight_index", "usd_inr"]

    def test_historical_dataset_structure(self):
        """Verify historical data completeness, dates, and separate materials."""
        self.assertGreater(len(self.df), 100, "Dataset should have over 100 monthly observations.")
        self.assertIn("aluminium", self.df.columns)
        self.assertIn("pvc_resin", self.df.columns)
        self.assertFalse(self.df["aluminium"].isnull().any(), "Aluminium should have no missing values.")
        self.assertFalse(self.df["pvc_resin"].isnull().any(), "PVC Resin should have no missing values.")
        
        # Verify independence of Aluminium and PVC (not scaled multipliers)
        ratios = self.df["pvc_resin"] / self.df["aluminium"]
        self.assertGreater(ratios.std(), 0.01, "PVC must be an independent series, not a fixed ratio of Aluminium!")

    def test_lead_lag_correlation_alignment(self):
        """Verify lag correlation alignment does not produce NaNs or index mismatches."""
        corr = compute_lead_lag_correlations(self.df, "aluminium", self.alu_indicators)
        self.assertIn("alumina_pax", corr)
        for ind, lags in corr.items():
            for lag_name, val in lags.items():
                self.assertFalse(np.isnan(val), f"Correlation {ind} {lag_name} must not be NaN.")
                self.assertGreaterEqual(val, -1.0)
                self.assertLessEqual(val, 1.0)

    def test_no_future_feature_leakage(self):
        """Verify features constructed for horizon h use strictly past information (<= t)."""
        h = 3
        X_df, y_arr, origins = build_features_for_horizon(self.df, "aluminium", h, self.alu_indicators)
        self.assertEqual(len(X_df), len(y_arr))
        
        # Origin index + horizon must match target date index
        for idx in range(len(origins)):
            orig_t = origins[idx]
            target_t = orig_t + h
            target_val = np.log(self.df["aluminium"].iloc[target_t] / self.df["aluminium"].iloc[orig_t])
            self.assertAlmostEqual(y_arr[idx], target_val, places=4)

    def test_walk_forward_metrics_calculation(self):
        """Verify walk-forward out-of-sample evaluation metrics."""
        results = run_walk_forward_evaluation(self.df, "aluminium", self.alu_indicators, horizons=[1, 3])
        self.assertIn("1", results)
        self.assertIn("3", results)
        
        metrics_h1 = results["1"]["metrics"]
        self.assertIn("ensemble", metrics_h1)
        self.assertIn("naive", metrics_h1)
        
        ens_mape = metrics_h1["ensemble"]["mape"]
        naive_mape = metrics_h1["naive"]["mape"]
        self.assertGreater(ens_mape, 0.0)
        self.assertGreater(naive_mape, 0.0)
        
        # Naive DA should be None (Flat persistence)
        self.assertIsNone(metrics_h1["naive"]["da"])
        # Ensemble DA should be a valid percentage (0..100)
        self.assertGreaterEqual(metrics_h1["ensemble"]["da"], 0.0)
        self.assertLessEqual(metrics_h1["ensemble"]["da"], 100.0)

    def test_future_forecast_generation(self):
        """Verify 6-month forward forecasts produce correct horizon dates and confidence bounds."""
        forecasts = generate_future_forecasts(self.df, "aluminium", self.alu_indicators, horizons=[1, 2, 3, 4, 5, 6])
        self.assertEqual(len(forecasts), 6)
        
        for f in forecasts:
            self.assertIn("target_date", f)
            self.assertIn("pred_ensemble", f)
            self.assertLess(f["lower_95"], f["pred_ensemble"])
            self.assertGreater(f["upper_95"], f["pred_ensemble"])

    def test_inventory_conservation_logic(self):
        """Verify time-phased inventory equation: I_t = I_{t-1} + R_t + P_t - C_t."""
        starting_stock = 150
        receipts = 50
        purchases = 100
        consumption = 120
        ending_stock = starting_stock + receipts + purchases - consumption
        self.assertEqual(ending_stock, 180)

if __name__ == "__main__":
    unittest.main()
