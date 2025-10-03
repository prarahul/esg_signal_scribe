# ESG Signal Scribe - Streamlit Deployment Guide 🚀

## Quick Deploy to Streamlit Cloud

### Step 1: Push to GitHub
Your Streamlit app is ready! The files are already in your repository:
- `streamlit_app.py` - Main Streamlit application
- `requirements.txt` - Python dependencies

### Step 2: Deploy on Streamlit Cloud
1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Sign in with your GitHub account
3. Click "New app"
4. Select your repository: `prarahul/esg_signal_scribe`
5. Set the main file path: `streamlit_app.py`
6. Click "Deploy!"

### Step 3: Your Live App
Once deployed, you'll get a public URL like:
- `https://esg-signal-scribe.streamlit.app`

## Features Available in Streamlit Version

### 🎯 ESG Prediction Page
- Interactive sliders for all ESG metrics
- Real-time score prediction
- Score interpretation and breakdown
- Component analysis with charts

### 📈 Dashboard Page  
- Company selection and analysis
- ESG trend visualization over time
- Industry comparison charts
- Radar chart for ESG components

### 🔍 Model Insights Page
- Model performance metrics (R², RMSE, MAE)
- Feature importance visualization
- Training information details

### 📁 Batch Processing Page
- CSV file upload functionality
- Bulk ESG score predictions
- Results download as CSV
- Prediction summary statistics

## Sample Data Included
The app includes built-in sample data with:
- 20 major companies (Apple, Microsoft, Tesla, etc.)
- Multiple industries (Technology, Energy, Healthcare, etc.)
- 5 years of historical data (2020-2024)
- All required ESG metrics

## How to Use
1. **Single Predictions**: Use sliders to input company metrics
2. **Company Analysis**: Select from dropdown to view trends
3. **Batch Upload**: Upload CSV with required columns
4. **Model Insights**: View ML model performance details

## CSV Upload Format
Required columns for batch processing:
```
environmental_score,social_score,governance_score,carbon_emissions,employee_satisfaction,board_diversity,controversies
75.0,80.0,85.0,1200.0,75.0,60.0,2.0
```

## Technical Stack
- **Streamlit**: Web app framework
- **Plotly**: Interactive visualizations  
- **scikit-learn**: Random Forest ML model
- **Pandas/NumPy**: Data processing

## Benefits of Streamlit Version
✅ **No setup required** - runs in browser
✅ **Public access** - shareable URL
✅ **Interactive UI** - sliders, uploads, downloads
✅ **Real-time predictions** - instant results
✅ **Professional visualizations** - Plotly charts
✅ **Mobile responsive** - works on all devices

Your ESG Signal Scribe is now ready for public use! 🌱