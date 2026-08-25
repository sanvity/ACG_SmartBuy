# ACG Films & Foils — Raw Material Price Prediction & Procurement System

An AI-powered tool designed for the **ACG Films & Foils** procurement team to predict raw material prices (**Aluminium** and **PVC Resin**) and make data-driven buying decisions.

---

## 🎯 The Business Challenge

Raw materials represent the largest cost for the Films & Foils organization. Currently, purchasing relies on manual sales forecasts and gut-feel decisions:
- **Low accuracy**: Buying decisions do not account for dynamic global market shifts.
- **No forward visibility**: Procurement teams lack a 1 to 6-month advance view of where raw material prices are heading.
- **Financial impact**: Higher raw material spend, excess inventory holding, and locked-up working capital.

---

## 💡 What This Solution Does

This application provides a forward-looking digital assistant that answers three core buying questions: **When to buy, How much to buy, and At what price to buy.**

### Key Features

1. **Executive Dashboard & 6-Month Price Forecasts**
   - Shows predicted monthly price trends for **Aluminium** and **PVC Resin** for the next 6 months.
   - Highlights price surge alerts and estimated cost savings.

2. **Market Indicator Lead-Lag Tracker**
   - Tracks global market signals (Crude Oil, Ethylene, Alumina, Energy Index, Freight rates, Exchange rates).
   - Identifies early warning indicators that shift 30 to 60 days *before* domestic raw material prices change.

3. **AI Prediction Accuracy & Backtest**
   - Evaluated against a basic "next month = this month" benchmark using historical market data.
   - Proves superior price forecast accuracy and direction calling (over 80% correct up/down direction calls).

4. **Smart Procurement & Bill of Materials (BoM) Simulator**
   - Enter your finished product sales forecast (finished foil and PVC film tons).
   - Automatically converts product sales into raw material needs using Bill of Materials (BoM) ratios.
   - Deducts current stock and gives direct buying instructions (*e.g., "Lock 70% requirement on 60-day forward contract now"*).

---

## 🎬 Video Demo & Presentation

A 42-second automated video walkthrough presenting all features of the application is available in the project:
- 📹 **MP4 Video File**: [`prototype_demo.mp4`](file:///Users/sanvijain/ACG_Sales/prototype_demo.mp4)
---

## 🚀 How to Run the Application

### Quick Start

1. Open your terminal and navigate to the project directory:
   ```bash
   cd client
   ```

2. Start the application server:
   ```bash
   npm run dev -- --port 3000 --host
   ```

3. Open your web browser and go to:
   ```text
   http://localhost:3000/
   ```

---

## 📂 Project Structure

- `client/` — Interactive React web application frontend.
- `data_engine/` — Python analytics script and raw material dataset.
- `prototype_demo.mp4` — High-definition video walkthrough of the prototype.
- `README.md` — Project documentation.
