# 🌍 ESG Signal Scribe 🌱
**AI-Powered ESG Risk Scoring Platform**

An AI-powered platform for **ESG risk assessment** and **sustainable investment decision-making**.  
It transforms complex Environmental, Social, and Governance (ESG) data into actionable insights using **machine learning** and **interactive analytics**.

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![Machine Learning](https://img.shields.io/badge/ML-scikit--learn-orange.svg)](https://scikit-learn.org/)

---

## 📖 About This Project
**ESG Signal Scribe** helps investors and analysts make informed sustainable investment decisions by:

- Predicting **ESG scores** with machine learning  
- Visualizing company ESG trends vs. industry benchmarks  
- Enabling **comparisons** between peers  
- Processing **batch data** with CSV uploads  
- Offering **model transparency** with feature importance & performance metrics  

Think of it as your **personal ESG analyst that never sleeps**!

---

## ✨ Key Features
- 📊 **Smart ESG Predictions** (Random Forest ML model)  
- 🔍 **Model Transparency** (feature importance, RMSE, MAE, R²)  
- 📈 **Interactive Dashboards** with industry comparisons & trends  
- 🏢 **Company Search** with intelligent filtering  
- 📂 **Batch Processing** for CSV uploads  
- ✅ **Automatic data validation** with error handling  
- 📱 **Responsive Design** (works on any device)  

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript  
- Vite (build tool)  
- Tailwind CSS + shadcn/ui (UI components)  
- Recharts (interactive visualizations)  
- React Router  

### Backend
- FastAPI (REST API)  
- scikit-learn (ML model training & inference)  
- pandas, NumPy (data processing)  
- joblib (model persistence)  
- Uvicorn (server)  

### DevOps & Deployment
- Git / GitHub (version control)  
- Netlify (frontend hosting)  
- Docker-ready backend  
- Environment variables for configuration  

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v16+ & npm  
- Python 3.8+ with pip  
- Git installed

###Project Architecture
 ┌─────────────────────┐    API Calls     ┌────────────────────┐
│   React Frontend    │ ←─────────────→  │   FastAPI Backend  │
│   (TypeScript)      │    JSON/REST     │   (Python ML)      │
└─────────────────────┘                  └────────────────────┘
          │                                        │
          ▼                                        ▼
┌─────────────────────┐                  ┌────────────────────┐
│   Netlify Hosting   │                  │   ML Model (.pkl)  │
│   (Static Files)    │                  │   ESG Data Source  │
└─────────────────────┘                  └────────────────────┘
 

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/prarahul/esg_signal_scribe.git
cd esg_signal_scribe

```
Usage Guide
Dashboard Navigation

🔎 Company Search: Find companies by name/industry

📈 ESG Trends: View historical performance

📊 Industry Comparisons: Benchmark across peers

📑 Model Insights: Feature importance & diagnostics

Making Predictions

Single Prediction → Input ESG metrics in form

Batch Upload → Upload CSV with:

environmental_score, social_score, governance_score,

carbon_emissions, employee_satisfaction,

board_diversity, controversies
