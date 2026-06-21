<div align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-3.11-FFD43B?style=for-the-badge&logo=python&logoColor=black"/>
<img src="https://img.shields.io/badge/XGBoost-ML-E76F51?style=for-the-badge"/>
<img src="https://img.shields.io/badge/LightGBM-Ensemble-4CAF50?style=for-the-badge"/>
<img src="https://img.shields.io/badge/SHAP-Explainable_AI-7C3AED?style=for-the-badge"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Status-Completed-success?style=for-the-badge"/>

<br/>

# AlphaSector — AI-Powered Stock Sector Growth Prediction

**Predict sector-wise growth probabilities for the Indian stock market using Machine Learning, Explainable AI, and Financial Technical Indicators.**

</div>

---

## Overview 📈

AlphaSector is a full-stack **Financial Machine Learning Platform** that predicts the probability of growth across major Indian stock market sectors.

Using **historical NSE market data**, **technical indicators**, **feature engineering**, and **ensemble machine learning models**, AlphaSector generates sector-wise investment insights together with **SHAP Explainable AI**, allowing users to understand *why* a prediction was made rather than only seeing the prediction itself.

The platform combines modern **React**, **FastAPI**, and **XGBoost** into a responsive dashboard built for financial analytics.

---

## Features ✨

- Live sector-wise growth probability prediction
- Machine Learning powered by **XGBoost**
- **LightGBM** ensemble comparison
- Explainable AI using **SHAP**
- Financial feature engineering using technical indicators
- Interactive dashboard with prediction cards
- Company search with live NSE stock lookup
- Historical prediction tracking
- Stock comparison interface
- REST API built with FastAPI
- Responsive React frontend
- Modular ML pipeline for future model improvements

---

## Architecture Overview 🧠

    User
     │
     ├── React Frontend
     │     ├── Dashboard
     │     ├── Live Sector Predictions
     │     ├── Stock Search
     │     ├── Compare Stocks
     │     ├── Performance Analytics
     │     └── Prediction History
     │
     └── FastAPI Backend
           ├── Market Data Fetcher
           ├── Feature Engineering
           ├── Technical Indicators
           ├── XGBoost Prediction Engine
           ├── SHAP Explainability
           └── Prediction API

---

## Machine Learning Pipeline 🔬

| Step | Action |
|------|--------|
| 1 | Download historical market data using Yahoo Finance |
| 2 | Clean and preprocess financial datasets |
| 3 | Generate technical indicators using TA library |
| 4 | Perform feature engineering |
| 5 | Train XGBoost & LightGBM models |
| 6 | Evaluate model performance |
| 7 | Generate sector-wise predictions |
| 8 | Explain predictions using SHAP feature importance |
| 9 | Display results in the React dashboard |

---

## Project Structure 🏗️

    AlphaSector/
    │
    ├── backend/
    │   ├── app/
    │   │   ├── ml/
    │   │   │   ├── fetch_data.py
    │   │   │   ├── feature_engineering.py
    │   │   │   ├── build_stock_dataset.py
    │   │   │   ├── train_model.py
    │   │   │   ├── predict.py
    │   │   │   └── __init__.py
    │   │   │
    │   │   ├── routers/
    │   │   ├── database.py
    │   │   ├── main.py
    │   │   └── __init__.py
    │   │
    │   ├── data/
    │   ├── models/
    │   ├── requirements.txt
    │   └── venv/
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── hooks/
    │   │   └── App.tsx
    │   ├── package.json
    │   └── vite.config.ts
    │
    ├── .gitignore
    └── README.md

---

## Tech Stack 🛠️

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript | Interactive Dashboard |
| **Backend** | FastAPI | REST API |
| **Machine Learning** | XGBoost | Sector Prediction |
| **Ensemble** | LightGBM | Model Comparison |
| **Explainability** | SHAP | Feature Importance |
| **Data Source** | Yahoo Finance | Historical Market Data |
| **Feature Engineering** | TA Library | Technical Indicators |
| **Data Processing** | Pandas + NumPy | Dataset Preparation |
| **Model Storage** | Joblib | Model Serialization |
| **Visualization** | React Charts | Dashboard Analytics |

---

## AI Capabilities 🤖

| Capability | Status | Description |
|------------|--------|-------------|
| Sector Prediction | ✅ Live | Predicts probability of sector growth |
| Feature Engineering | ✅ Live | Technical indicators generated automatically |
| Explainable AI | ✅ Live | SHAP explains every prediction |
| Technical Analysis | ✅ Live | RSI, MACD, Bollinger Bands, ATR, EMA and more |
| Ensemble Learning | ✅ Live | XGBoost + LightGBM |
| REST API | ✅ Live | Prediction endpoints for frontend |
| Live Dashboard | ✅ Live | Interactive prediction cards |
| Model Retraining | 🚧 Planned | Automatic periodic retraining |

---

## Installation ⚙️

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

---

### Clone Repository

    git clone https://github.com/satwiktelang18/AlphaSector.git

    cd AlphaSector

---

### Backend Setup

    cd backend

    python3 -m venv venv

    source venv/bin/activate

    pip install -r requirements.txt

Run FastAPI

    uvicorn app.main:app --reload

---

### Frontend Setup

    cd frontend

    npm install

    npm run dev

---

Open

    http://localhost:5173

---

## Usage ▶️

1. Open the dashboard
2. View sector-wise ML predictions
3. Search any supported stock
4. Compare multiple sectors
5. Analyze SHAP feature importance
6. Monitor prediction history
7. Explore market performance insights

---

## Prediction Workflow 📊

    Historical Market Data
               │
               ▼
       Feature Engineering
               │
               ▼
     Technical Indicators
               │
               ▼
      XGBoost Prediction
               │
               ▼
      SHAP Explainability
               │
               ▼
       FastAPI REST API
               │
               ▼
       React Dashboard

---

# 💡 Why AlphaSector?

Most stock dashboards only visualize historical prices.

AlphaSector goes beyond visualization by applying **Machine Learning**, **Financial Feature Engineering**, and **Explainable AI** to estimate future sector performance.

Instead of treating predictions as black boxes, SHAP highlights which financial indicators contributed the most, making the platform both predictive and interpretable.

---

## Future Improvements 🚀

- [x] Sector Growth Prediction
- [x] Financial Feature Engineering
- [x] XGBoost Model
- [x] SHAP Explainability
- [x] FastAPI Backend
- [x] React Dashboard
- [x] Live Stock Search
- [x] Prediction History
- [ ] Real-time NSE Streaming
- [ ] LSTM Time-Series Forecasting
- [ ] Portfolio Optimization
- [ ] News Sentiment Analysis
- [ ] AI Investment Assistant
- [ ] Cloud Deployment (AWS / Render / Vercel)

---

## 👨‍💻 Author

**Satwik Telang**
