import streamlit as st
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import joblib
import io
from pathlib import Path
import json
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="ESG Signal Scribe 🌱 - Making ESG investing smarter with AI-powered insights",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
.main-header {
    font-size: 3rem;
    color: #2E8B57;
    text-align: center;
    margin-bottom: 2rem;
}
.metric-card {
    background-color: #f0f8f0;
    padding: 1rem;
    border-radius: 10px;
    border-left: 5px solid #2E8B57;
}
.prediction-box {
    background-color: #e8f5e8;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    border: 2px solid #2E8B57;
}
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'model' not in st.session_state:
    st.session_state.model = None
if 'model_metrics' not in st.session_state:
    st.session_state.model_metrics = {}
if 'data' not in st.session_state:
    st.session_state.data = None

@st.cache_data
def load_sample_data():
    """Load sample ESG data"""
    # Create sample data since we don't have access to the original CSV
    np.random.seed(42)
    companies = [
        "Apple Inc.", "Microsoft Corp.", "Amazon.com Inc.", "Alphabet Inc.", "Tesla Inc.",
        "Meta Platforms Inc.", "NVIDIA Corp.", "ExxonMobil Corp.", "JPMorgan Chase", "Johnson & Johnson",
        "Procter & Gamble", "Coca-Cola Co.", "PepsiCo Inc.", "Walmart Inc.", "Disney Co.",
        "Nike Inc.", "McDonald's Corp.", "Starbucks Corp.", "Netflix Inc.", "Adobe Inc."
    ]
    
    industries = [
        "Technology", "Technology", "Technology", "Technology", "Automotive",
        "Technology", "Technology", "Energy", "Financial", "Healthcare",
        "Consumer Goods", "Beverages", "Beverages", "Retail", "Entertainment",
        "Consumer Goods", "Food Service", "Food Service", "Entertainment", "Technology"
    ]
    
    regions = ["North America"] * 20
    
    data = []
    for i in range(100):  # Generate 100 records with some companies having multiple years
        company_idx = i % len(companies)
        year = 2020 + (i // 20)
        
        # Generate correlated ESG scores
        environmental_base = np.random.uniform(60, 95)
        social_base = np.random.uniform(65, 90)
        governance_base = np.random.uniform(70, 95)
        
        # Add some correlation between scores
        environmental_score = environmental_base + np.random.normal(0, 5)
        social_score = social_base + np.random.normal(0, 4)
        governance_score = governance_base + np.random.normal(0, 3)
        
        # Carbon emissions (lower is better, so inverse correlation with environmental score)
        carbon_emissions = max(100, 2000 - environmental_score * 15 + np.random.normal(0, 200))
        
        # Other metrics
        employee_satisfaction = 50 + (social_score - 65) * 0.8 + np.random.normal(0, 8)
        board_diversity = max(0, min(100, governance_score - 20 + np.random.normal(0, 10)))
        controversies = max(0, 10 - (governance_score - 70) * 0.2 + np.random.normal(0, 2))
        
        # Calculate ESG score (weighted average with some noise)
        esg_score = (environmental_score * 0.4 + social_score * 0.35 + governance_score * 0.25 + 
                    np.random.normal(0, 3))
        
        data.append({
            'company': companies[company_idx],
            'industry': industries[company_idx],
            'region': regions[company_idx],
            'year': year,
            'environmental_score': round(max(0, min(100, environmental_score)), 1),
            'social_score': round(max(0, min(100, social_score)), 1),
            'governance_score': round(max(0, min(100, governance_score)), 1),
            'carbon_emissions': round(max(50, carbon_emissions), 1),
            'employee_satisfaction': round(max(0, min(100, employee_satisfaction)), 1),
            'board_diversity': round(max(0, min(100, board_diversity)), 1),
            'controversies': round(max(0, controversies), 1),
            'esg_score': round(max(0, min(100, esg_score)), 1)
        })
    
    return pd.DataFrame(data)

@st.cache_resource
def train_model(data):
    """Train the Random Forest model"""
    # Prepare features
    data_clean = data.dropna(subset=['esg_score'])
    data_clean['log_carbon_emissions'] = np.log(data_clean['carbon_emissions'] + 1)
    
    features = ['environmental_score', 'social_score', 'governance_score', 
                'log_carbon_emissions', 'employee_satisfaction', 'board_diversity', 'controversies']
    
    X = data_clean[features]
    y = data_clean['esg_score']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    
    # Train Random Forest model
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)
    
    # Calculate metrics
    y_pred = model.predict(X_test)
    metrics = {
        'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
        'mae': float(mean_absolute_error(y_test, y_pred)),
        'r2': float(r2_score(y_test, y_pred)),
        'n_train': len(X_train),
        'n_test': len(X_test)
    }
    
    return model, metrics, features

def predict_esg_score(model, features, input_data):
    """Make ESG score prediction"""
    # Prepare input data
    input_df = pd.DataFrame([input_data])
    input_df['log_carbon_emissions'] = np.log(input_df['carbon_emissions'] + 1)
    
    # Make prediction
    prediction = model.predict(input_df[features])[0]
    return max(0, min(100, prediction))

def main():
    # Header
    st.markdown('<h1 class="main-header">🌱 ESG Signal Scribe</h1>', unsafe_allow_html=True)
    st.markdown('<p style="text-align: center; font-size: 1.2rem; color: #666; font-weight: 500;">Making ESG investing smarter with AI-powered insights</p>', unsafe_allow_html=True)
    
    # Load data and train model
    if st.session_state.data is None:
        with st.spinner("Loading ESG data and training model..."):
            st.session_state.data = load_sample_data()
            st.session_state.model, st.session_state.model_metrics, st.session_state.features = train_model(st.session_state.data)
    
    # Sidebar
    st.sidebar.title("📊 Navigation")
    page = st.sidebar.selectbox("Choose a page:", 
                               ["🎯 ESG Prediction", "📈 Dashboard", "🔍 Model Insights", "📁 Batch Processing"])
    
    if page == "🎯 ESG Prediction":
        prediction_page()
    elif page == "📈 Dashboard":
        dashboard_page()
    elif page == "🔍 Model Insights":
        model_insights_page()
    elif page == "📁 Batch Processing":
        batch_processing_page()

def prediction_page():
    st.header("🎯 Single ESG Score Prediction")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Input ESG Metrics")
        
        environmental_score = st.slider("Environmental Score", 0.0, 100.0, 75.0, 0.1,
                                       help="Company's environmental performance (0-100)")
        social_score = st.slider("Social Score", 0.0, 100.0, 75.0, 0.1,
                                help="Company's social responsibility performance (0-100)")
        governance_score = st.slider("Governance Score", 0.0, 100.0, 75.0, 0.1,
                                    help="Company's governance quality (0-100)")
        carbon_emissions = st.number_input("Carbon Emissions (tons CO2)", 100.0, 5000.0, 1000.0,
                                         help="Annual carbon emissions in tons")
        employee_satisfaction = st.slider("Employee Satisfaction", 0.0, 100.0, 75.0, 0.1,
                                        help="Employee satisfaction score (0-100)")
        board_diversity = st.slider("Board Diversity", 0.0, 100.0, 50.0, 0.1,
                                  help="Board diversity percentage (0-100)")
        controversies = st.slider("Controversies Count", 0.0, 20.0, 2.0, 0.1,
                                help="Number of ESG-related controversies")
    
    with col2:
        st.subheader("ESG Score Prediction")
        
        # Prepare input data
        input_data = {
            'environmental_score': environmental_score,
            'social_score': social_score,
            'governance_score': governance_score,
            'carbon_emissions': carbon_emissions,
            'employee_satisfaction': employee_satisfaction,
            'board_diversity': board_diversity,
            'controversies': controversies
        }
        
        # Make prediction
        if st.button("🔮 Predict ESG Score", type="primary"):
            predicted_score = predict_esg_score(st.session_state.model, st.session_state.features, input_data)
            
            # Display prediction
            st.markdown(f'''
            <div class="prediction-box">
                <h2>Predicted ESG Score</h2>
                <h1 style="color: #2E8B57; font-size: 4rem;">{predicted_score:.1f}</h1>
                <p>Out of 100</p>
            </div>
            ''', unsafe_allow_html=True)
            
            # Score interpretation
            if predicted_score >= 80:
                st.success("🌟 Excellent ESG Performance")
                interpretation = "This company demonstrates outstanding environmental, social, and governance practices."
            elif predicted_score >= 70:
                st.info("✅ Good ESG Performance")
                interpretation = "This company shows solid ESG practices with room for improvement."
            elif predicted_score >= 60:
                st.warning("⚠️ Average ESG Performance")
                interpretation = "This company has moderate ESG practices that need enhancement."
            else:
                st.error("❌ Poor ESG Performance")
                interpretation = "This company shows significant ESG risks and requires immediate attention."
            
            st.write(interpretation)
            
            # Feature contribution breakdown
            st.subheader("Score Breakdown")
            breakdown_data = {
                'Component': ['Environmental', 'Social', 'Governance'],
                'Score': [environmental_score, social_score, governance_score],
                'Weight': [40, 35, 25]
            }
            breakdown_df = pd.DataFrame(breakdown_data)
            
            fig = px.bar(breakdown_df, x='Component', y='Score', color='Component',
                        title="ESG Component Scores")
            st.plotly_chart(fig, use_container_width=True)

def dashboard_page():
    st.header("📈 ESG Analytics Dashboard")
    
    # Company selector
    companies = st.session_state.data['company'].unique()
    selected_company = st.selectbox("Select Company for Analysis:", companies)
    
    company_data = st.session_state.data[st.session_state.data['company'] == selected_company]
    
    if len(company_data) > 0:
        col1, col2, col3, col4 = st.columns(4)
        
        latest_data = company_data.iloc[-1]
        
        with col1:
            st.metric("Latest ESG Score", f"{latest_data['esg_score']:.1f}")
        with col2:
            st.metric("Environmental", f"{latest_data['environmental_score']:.1f}")
        with col3:
            st.metric("Social", f"{latest_data['social_score']:.1f}")
        with col4:
            st.metric("Governance", f"{latest_data['governance_score']:.1f}")
        
        # Trend analysis
        if len(company_data) > 1:
            st.subheader("ESG Score Trend")
            fig = px.line(company_data, x='year', y='esg_score', 
                         title=f"ESG Score Trend for {selected_company}")
            st.plotly_chart(fig, use_container_width=True)
        
        # Industry comparison
        st.subheader("Industry Comparison")
        industry = latest_data['industry']
        industry_data = st.session_state.data[st.session_state.data['industry'] == industry]
        industry_avg = industry_data.groupby('company')['esg_score'].mean().reset_index()
        
        fig = px.bar(industry_avg.head(10), x='company', y='esg_score',
                    title=f"ESG Scores in {industry} Industry")
        fig.add_hline(y=latest_data['esg_score'], line_dash="dash", 
                     annotation_text=f"{selected_company}")
        st.plotly_chart(fig, use_container_width=True)
        
        # ESG Components Radar Chart
        st.subheader("ESG Components Analysis")
        categories = ['Environmental', 'Social', 'Governance']
        values = [latest_data['environmental_score'], latest_data['social_score'], latest_data['governance_score']]
        
        fig = go.Figure()
        fig.add_trace(go.Scatterpolar(
            r=values + [values[0]],  # Close the shape
            theta=categories + [categories[0]],
            fill='toself',
            name=selected_company
        ))
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100]
                )),
            showlegend=True,
            title="ESG Components Radar Chart"
        )
        st.plotly_chart(fig, use_container_width=True)

def model_insights_page():
    st.header("🔍 Model Performance Insights")
    
    metrics = st.session_state.model_metrics
    
    # Model performance metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("R² Score", f"{metrics['r2']:.3f}", 
                 help="Coefficient of determination (higher is better)")
    with col2:
        st.metric("RMSE", f"{metrics['rmse']:.2f}", 
                 help="Root Mean Square Error (lower is better)")
    with col3:
        st.metric("MAE", f"{metrics['mae']:.2f}", 
                 help="Mean Absolute Error (lower is better)")
    
    # Feature importance
    st.subheader("Feature Importance")
    importances = st.session_state.model.feature_importances_
    feature_names = st.session_state.features
    
    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values('Importance', ascending=True)
    
    fig = px.bar(importance_df, x='Importance', y='Feature', orientation='h',
                title="Feature Importance in ESG Score Prediction")
    st.plotly_chart(fig, use_container_width=True)
    
    # Model training info
    st.subheader("Model Training Information")
    st.write(f"- **Algorithm**: Random Forest Regressor")
    st.write(f"- **Number of Estimators**: 200")
    st.write(f"- **Training Samples**: {metrics['n_train']}")
    st.write(f"- **Test Samples**: {metrics['n_test']}")
    st.write(f"- **Features Used**: {len(st.session_state.features)}")

def batch_processing_page():
    st.header("📁 Batch ESG Score Prediction")
    
    st.write("Upload a CSV file with the following columns to get ESG score predictions:")
    
    required_columns = ['environmental_score', 'social_score', 'governance_score', 
                       'carbon_emissions', 'employee_satisfaction', 'board_diversity', 'controversies']
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Required Columns:")
        for col in required_columns:
            st.write(f"• {col}")
    
    with col2:
        st.subheader("Sample Data:")
        sample_data = {
            'company': ['Company A', 'Company B'],
            'environmental_score': [75.0, 85.0],
            'social_score': [80.0, 70.0],
            'governance_score': [85.0, 90.0],
            'carbon_emissions': [1200.0, 800.0],
            'employee_satisfaction': [75.0, 85.0],
            'board_diversity': [60.0, 70.0],
            'controversies': [2.0, 1.0]
        }
        sample_df = pd.DataFrame(sample_data)
        st.dataframe(sample_df)
    
    # File upload
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
    
    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            st.write("📊 Uploaded Data Preview:")
            st.dataframe(df.head())
            
            # Check required columns
            missing_cols = [col for col in required_columns if col not in df.columns]
            
            if missing_cols:
                st.error(f"Missing required columns: {', '.join(missing_cols)}")
            else:
                if st.button("🚀 Generate ESG Predictions", type="primary"):
                    with st.spinner("Generating predictions..."):
                        # Make predictions
                        predictions = []
                        for _, row in df.iterrows():
                            input_data = {col: row[col] for col in required_columns}
                            pred = predict_esg_score(st.session_state.model, st.session_state.features, input_data)
                            predictions.append(pred)
                        
                        df['predicted_esg_score'] = predictions
                        
                        st.success(f"✅ Generated predictions for {len(df)} records!")
                        st.dataframe(df)
                        
                        # Download results
                        csv_buffer = io.StringIO()
                        df.to_csv(csv_buffer, index=False)
                        st.download_button(
                            label="📥 Download Results as CSV",
                            data=csv_buffer.getvalue(),
                            file_name="esg_predictions.csv",
                            mime="text/csv"
                        )
                        
                        # Summary statistics
                        st.subheader("📊 Prediction Summary")
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.metric("Average ESG Score", f"{df['predicted_esg_score'].mean():.1f}")
                        with col2:
                            st.metric("Highest Score", f"{df['predicted_esg_score'].max():.1f}")
                        with col3:
                            st.metric("Lowest Score", f"{df['predicted_esg_score'].min():.1f}")
                        
                        # Distribution plot
                        fig = px.histogram(df, x='predicted_esg_score', nbins=20,
                                         title="Distribution of Predicted ESG Scores")
                        st.plotly_chart(fig, use_container_width=True)
        
        except Exception as e:
            st.error(f"Error processing file: {str(e)}")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>🌱 ESG Signal Scribe - Built with Streamlit</p>
    <p>Making ESG investing smarter with AI-powered insights</p>
</div>
""", unsafe_allow_html=True)

if __name__ == "__main__":
    main()