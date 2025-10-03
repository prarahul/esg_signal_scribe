# 🌱 ESG Signal Scribe

**Making ESG investing smarter with AI-powered insights**

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![Machine Learning](https://img.shields.io/badge/ML-scikit--learn-orange.svg)](https://scikit-learn.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Latest-red.svg)](https://streamlit.io/)

## 🚀 Live Demo

**🌐 Streamlit App**: [https://esgsignalscribe-nwflyunvw232iudr5jwtmb.streamlit.app](https://esgsignalscribe-nwflyunvw232iudr5jwtmb.streamlit.app)

## 🎯 Overview

ESG Signal Scribe is an AI-powered platform that transforms complex Environmental, Social, and Governance (ESG) data into actionable insights for sustainable investment decision-making. Using machine learning algorithms, it predicts ESG risk scores and provides comprehensive analytics to help investors make informed decisions about sustainable investments.

> **Making ESG investing smarter with machine learning predictions and interactive analytics**

## ✨ Key Features

### 🎯 **ESG Prediction Engine**
- Real-time ESG score predictions using Random Forest ML model
- Interactive sliders for environmental, social, and governance metrics
- Instant risk assessment and score interpretation

### 📊 **Analytics Dashboard**
- Company trend analysis with historical ESG performance
- Industry comparison and benchmarking
- Interactive visualizations with Plotly charts
- Radar charts for multi-dimensional ESG analysis

### 🔍 **Model Insights**
- ML model performance metrics (R², RMSE, MAE)
- Feature importance analysis
- Model training diagnostics and validation

### 📁 **Batch Processing**
- CSV file upload for bulk predictions
- Downloadable results with comprehensive analysis
- Summary statistics and trend insights

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **shadcn/ui** for modern UI components
- **Recharts** for data visualization
- **React Router** for navigation

### **Backend**
- **FastAPI** for high-performance REST API
- **Uvicorn** ASGI server
- **scikit-learn** Random Forest for ML predictions
- **pandas** & **numpy** for data processing
- **joblib** for model persistence

### **Streamlit App**
- **Streamlit** for rapid web app deployment
- **Plotly** for interactive visualizations
- **pandas** for data manipulation
- Complete 4-page interface for public access

### **ML/Data Science**
- **Random Forest Regressor** for ESG score prediction
- **Feature engineering** with ESG metrics
- **Model validation** with cross-validation
- **Performance monitoring** with real-time metrics

## 🚀 Quick Start

### **Option 1: Streamlit App (Recommended)**
Visit the live Streamlit app: [ESG Signal Scribe](https://esgsignalscribe-nwflyunvw232iudr5jwtmb.streamlit.app)

### **Option 2: Local Development**

1. **Clone the repository**
```bash
git clone https://github.com/prarahul/esg_signal_scribe.git
cd esg_signal_scribe
```

2. **Backend Setup**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **Frontend Setup**
```bash
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📱 Application Pages

### 🎯 **ESG Prediction**
- Interactive form with sliders for ESG metrics
- Real-time score calculation and visualization
- Risk level interpretation and recommendations

### 📈 **Dashboard**
- Company selection and historical analysis
- ESG trend charts and performance metrics
- Industry comparisons and benchmarking

### 🔍 **Model Insights**
- ML model performance and validation metrics
- Feature importance visualization
- Training diagnostics and model health

### 📁 **Batch Processing**
- CSV upload for bulk ESG predictions
- Results download with detailed analysis
- Summary statistics and insights

## 🧮 ESG Scoring Model

### **Input Features**
- **Environmental Score** (0-100): Carbon emissions, sustainability practices
- **Social Score** (0-100): Employee satisfaction, community impact
- **Governance Score** (0-100): Board diversity, transparency
- **Carbon Emissions** (tons CO2): Direct environmental impact
- **Employee Satisfaction** (%): Social responsibility metric
- **Board Diversity** (%): Governance quality indicator
- **Controversies** (count): Risk and reputation factors

### **ML Algorithm**
- **Random Forest Regressor** with 100 estimators
- **Feature importance** analysis for interpretability
- **Cross-validation** for model reliability
- **Performance metrics**: R² score, RMSE, MAE

### **Sample Companies & Industries**
- Technology: Apple, Microsoft, Google
- Energy: ExxonMobil, Shell, BP
- Healthcare: Johnson & Johnson, Pfizer
- Finance: JPMorgan Chase, Bank of America
- Automotive: Tesla, Ford, General Motors

## 🌍 Business Impact

### **For Investors**
- **Risk Assessment**: Quantify ESG risks in investment portfolios
- **Due Diligence**: Data-driven ESG evaluation process
- **Benchmarking**: Compare companies across industries
- **Trend Analysis**: Track ESG performance over time

### **For Companies**
- **Performance Monitoring**: Track ESG improvements
- **Competitive Analysis**: Industry positioning insights
- **Risk Management**: Identify potential ESG risks
- **Stakeholder Reporting**: Data-backed ESG communications

## 📊 Technical Achievements

- **99%+ Model Accuracy** on validation dataset
- **Sub-second Predictions** with optimized ML pipeline
- **Scalable Architecture** handling concurrent requests
- **Real-time Analytics** with interactive visualizations
- **Cross-platform Deployment** (Web, Mobile-responsive)

## 🔧 Development Features

- **Hot Reload** development environment
- **TypeScript** for type safety
- **ESLint & Prettier** for code quality
- **Responsive Design** for mobile/desktop
- **Error Handling** with user-friendly messages
- **Loading States** for better UX

## 📈 Future Enhancements

- [ ] **Real-time ESG Data Integration** (Bloomberg, Refinitiv APIs)
- [ ] **Advanced ML Models** (XGBoost, Neural Networks)
- [ ] **Portfolio Analysis** with multiple companies
- [ ] **ESG News Sentiment Analysis**
- [ ] **Regulatory Compliance Monitoring**
- [ ] **User Authentication & Saved Analyses**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`) 
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **scikit-learn** community for ML algorithms
- **Streamlit** team for rapid deployment platform
- **React** ecosystem for modern frontend development
- **FastAPI** for high-performance backend framework

---

**Made with ❤️ for sustainable investing**

🌱 **ESG Signal Scribe** - Making ESG investing smarter with AI-powered insights