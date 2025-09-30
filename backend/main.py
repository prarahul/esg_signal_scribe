from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from pydantic import BaseModel
import io
import re
from pathlib import Path
import json
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib

app = FastAPI()  # Only ONE app instance!

# Resolve data CSV path relative to this file so it works no matter where uvicorn is launched from
BASE_DIR = Path(__file__).resolve().parent  # backend/
ROOT_DIR = BASE_DIR.parent                  # project root containing src/
DATA_CSV = ROOT_DIR / "src" / "data" / "esg_data.csv"
MODELS_DIR = BASE_DIR / "models" / "latest"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODELS_DIR / "model.pkl"
METRICS_PATH = MODELS_DIR / "metrics.json"
FEATURES_PATH = MODELS_DIR / "features.json"

# Root endpoint for status check
@app.get("/")
def read_root():
    return {"message": "ESG Signal Scribe API is running"}

# Allow CORS for local frontend
# Broadly allow cross-origin requests from browsers (no credentials). This ensures
# Access-Control-Allow-Origin is added for Netlify → ngrok calls, including preflight
# for multipart/form-data uploads.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint: Get all companies for search dropdown
@app.get("/company-list")
def get_company_list():
    df = pd.read_csv(DATA_CSV)
    # Return unique company names and sectors (and optionally industry)
    companies = df[['company', 'industry', 'region']].drop_duplicates().to_dict(orient='records')
    return {"companies": companies}

# Utility: Get company ESG info, trend, and industry comparison
@app.get("/company-esg-info")
def get_company_esg_info(
    company: str = Query(..., description="Company name, e.g. Apple Inc."),
    compare_with: str = Query(None, description="Company to compare with")
):
    global model
    df = pd.read_csv(DATA_CSV)
    
    # Normalize input
    company_norm = re.sub(r'\s+', ' ', company.strip().lower())
    # Normalize all company names in df
    df['company_norm'] = df['company'].astype(str).str.strip().str.lower().str.replace(r'\s+', ' ', regex=True)
    
    # Try exact match first
    company_row = df[df['company_norm'] == company_norm]
    # If not found, try partial match (contains)
    if company_row.empty:
        company_row = df[df['company_norm'].str.contains(company_norm)]
    if company_row.empty:
        return {"error": "Company not found"}
    
    company_row = company_row.iloc[0]
    company_info = company_row.to_dict()

    # Trend: last 5 years for this company (if available)
    trend = []
    trend_comparison_with_rest = []
    compare_trend = []
    
    if 'year' in df.columns:
        trend_df = df[df['company'].str.lower() == company_row['company'].lower()].sort_values('year').copy()
        trend_df['log_carbon_emissions'] = np.log(trend_df['carbon_emissions'] + 1)
        X_trend = trend_df[['environmental_score','social_score','governance_score','log_carbon_emissions','employee_satisfaction','board_diversity','controversies']]
        trend_pred = model.predict(X_trend) if model is not None else [None]*len(trend_df)
        
        trend = []
        for i, (idx, row) in enumerate(trend_df.iterrows()):
            trend.append({
                'year': int(row['year']) if not pd.isnull(row['year']) else None,
                'actual_esg_score': float(row['esg_score']) if not pd.isnull(row['esg_score']) else None,
                'predicted_esg_score': float(trend_pred[i]) if trend_pred[i] is not None else None
            })
        
        # Trend comparison with rest of companies (average per year)
        years = trend_df['year'].unique()
        for year in years:
            selected_row = trend_df[trend_df['year'] == year]
            selected_actual = float(selected_row['esg_score'].values[0]) if not selected_row.empty and not pd.isnull(selected_row['esg_score'].values[0]) else None
            selected_pred_idx = selected_row.index[0] if not selected_row.empty else None
            selected_pred = float(trend_pred[list(trend_df.index).index(selected_pred_idx)]) if selected_pred_idx is not None and trend_pred[list(trend_df.index).index(selected_pred_idx)] is not None else None
            
            rest_df_year = df[(df['company'].str.lower() != company_row['company'].lower()) & (df['year'] == year)].copy()
            rest_actual_avg = float(rest_df_year['esg_score'].mean()) if not rest_df_year.empty and not pd.isnull(rest_df_year['esg_score'].mean()) else None
            
            rest_pred_avg = None
            if not rest_df_year.empty and model is not None:
                rest_df_year['log_carbon_emissions'] = np.log(rest_df_year['carbon_emissions'] + 1)
                X_rest = rest_df_year[['environmental_score','social_score','governance_score','log_carbon_emissions','employee_satisfaction','board_diversity','controversies']]
                rest_pred = model.predict(X_rest)
                rest_pred_avg = float(np.mean(rest_pred)) if len(rest_pred) > 0 else None
            
            trend_comparison_with_rest.append({
                'year': int(year) if not pd.isnull(year) else None,
                'selected_company_actual': selected_actual,
                'selected_company_predicted': selected_pred,
                'rest_companies_actual_avg': rest_actual_avg,
                'rest_companies_predicted_avg': rest_pred_avg
            })

        # Direct company-to-company trend comparison
        if compare_with:
            compare_norm = re.sub(r'\s+', ' ', compare_with.strip().lower())
            df['compare_norm'] = df['company'].astype(str).str.strip().str.lower().str.replace(r'\s+', ' ', regex=True)
            compare_row = df[df['compare_norm'] == compare_norm]
            if compare_row.empty:
                compare_row = df[df['compare_norm'].str.contains(compare_norm)]
            if not compare_row.empty:
                compare_company = compare_row.iloc[0]['company']
                compare_trend_df = df[df['company'].str.lower() == compare_company.lower()].sort_values('year')
                for _, row in compare_trend_df.iterrows():
                    try:
                        x = np.array([
                            row['environmental_score'],
                            row['social_score'],
                            row['governance_score'],
                            np.log(row['carbon_emissions'] + 1),
                            row['employee_satisfaction'],
                            row['board_diversity'],
                            row['controversies']
                        ]).reshape(1, -1)
                        pred = model.predict(x)[0] if model is not None else None
                    except Exception:
                        pred = None
                    compare_trend.append({
                        'year': int(row['year']) if not pd.isnull(row['year']) else None,
                        'actual_esg_score': float(row['esg_score']) if not pd.isnull(row['esg_score']) else None,
                        'predicted_esg_score': float(pred) if pred is not None else None
                    })

    # Industry comparison for all companies in the same industry
    industry_comparison = []
    rest_comparison = []
    
    if 'industry' in df.columns:
        industry = company_row['industry']
        industry_df = df[df['industry'] == industry]
        
        for _, row in industry_df.iterrows():
            try:
                x_df = pd.DataFrame([{
                    'environmental_score': row['environmental_score'],
                    'social_score': row['social_score'],
                    'governance_score': row['governance_score'],
                    'log_carbon_emissions': np.log(row['carbon_emissions'] + 1),
                    'employee_satisfaction': row['employee_satisfaction'],
                    'board_diversity': row['board_diversity'],
                    'controversies': row['controversies']
                }])
                pred = model.predict(x_df)[0] if model is not None else None
            except Exception:
                pred = None
            industry_comparison.append({
                'company': str(row['company']),
                'actual_esg_score': float(row['esg_score']) if not pd.isnull(row['esg_score']) else None,
                'predicted_esg_score': float(pred) if pred is not None else None,
                'environmental_score': float(row['environmental_score']) if not pd.isnull(row['environmental_score']) else None,
                'social_score': float(row['social_score']) if not pd.isnull(row['social_score']) else None,
                'governance_score': float(row['governance_score']) if not pd.isnull(row['governance_score']) else None
            })
        
        # Comparison with rest of companies (outside selected industry)
        rest_df = df[df['industry'] != industry]
        for _, row in rest_df.iterrows():
            try:
                x_df = pd.DataFrame([{
                    'environmental_score': row['environmental_score'],
                    'social_score': row['social_score'],
                    'governance_score': row['governance_score'],
                    'log_carbon_emissions': np.log(row['carbon_emissions'] + 1),
                    'employee_satisfaction': row['employee_satisfaction'],
                    'board_diversity': row['board_diversity'],
                    'controversies': row['controversies']
                }])
                pred = model.predict(x_df)[0] if model is not None else None
            except Exception:
                pred = None
            rest_comparison.append({
                'company': str(row['company']),
                'actual_esg_score': float(row['esg_score']) if not pd.isnull(row['esg_score']) else None,
                'predicted_esg_score': float(pred) if pred is not None else None,
                'environmental_score': float(row['environmental_score']) if not pd.isnull(row['environmental_score']) else None,
                'social_score': float(row['social_score']) if not pd.isnull(row['social_score']) else None,
                'governance_score': float(row['governance_score']) if not pd.isnull(row['governance_score']) else None
            })

    return {
        "company": company_info,
        "trend": trend,
        "trendComparisonWithRest": trend_comparison_with_rest,
        "industryComparison": industry_comparison,
        "restOfCompaniesComparison": rest_comparison,
        "compareCompanyTrend": compare_trend
    }

# ML Model setup
model = None
features = ['environmental_score','social_score','governance_score','log_carbon_emissions','employee_satisfaction','board_diversity','controversies']
model_metrics = {}

def train_and_save_model():
    global model, model_metrics
    df = pd.read_csv(DATA_CSV)
    df = df.dropna(subset=['esg_score'])
    df['log_carbon_emissions'] = np.log(df['carbon_emissions'] + 1)
    X = df[features]
    y = df['esg_score']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    timestamp = datetime.utcnow().isoformat() + 'Z'
    model_metrics = {
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'n_estimators': 200,
        'trained_at': timestamp,
        'n_train': int(len(X_train)),
        'n_test': int(len(X_test)),
    }
    # Persist artifacts
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, 'w', encoding='utf-8') as f:
        json.dump(model_metrics, f)
    with open(FEATURES_PATH, 'w', encoding='utf-8') as f:
        json.dump({'features': features}, f)

class ESGInput(BaseModel):
    environmental_score: float
    social_score: float
    governance_score: float
    carbon_emissions: float
    employee_satisfaction: float
    board_diversity: float
    controversies: float

@app.on_event("startup")
def load_model():
    global model, model_metrics
    # Try load persisted model; fallback to training then save
    if MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            if METRICS_PATH.exists():
                with open(METRICS_PATH, 'r', encoding='utf-8') as f:
                    model_metrics.update(json.load(f))
        except Exception:
            model = None
    if model is None:
        train_and_save_model()

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.get('/readiness')
def readiness():
    return {'ready': model is not None}

@app.get('/model/metrics')
def get_model_metrics():
    # Always return metrics; if empty, indicate not trained
    return {'metrics': model_metrics, 'trained': model is not None}

@app.get('/model/features')
def get_model_features():
    return {'features': features}

@app.get('/model/feature-importance')
def get_feature_importance():
    if model is None or not hasattr(model, 'feature_importances_'):
        return {'featureImportance': []}
    importances = getattr(model, 'feature_importances_', None)
    if importances is None:
        return {'featureImportance': []}
    arr = [
        {'feature': f, 'importance': float(i)} for f, i in zip(features, importances)
    ]
    # normalize to sum=1 for easier charting
    total = sum(v['importance'] for v in arr) or 1.0
    for v in arr:
        v['importance'] = v['importance'] / total
    return {'featureImportance': arr}

@app.post("/predict")
def predict_esg(input: ESGInput):
    global model
    x = np.array([
        input.environmental_score,
        input.social_score,
        input.governance_score,
        np.log(input.carbon_emissions + 1),
        input.employee_satisfaction,
        input.board_diversity,
        input.controversies
    ]).reshape(1, -1)
    pred = model.predict(x)[0]
    return {"predicted_esg_score": float(pred)}

@app.post("/predict-csv")
def predict_csv(file: UploadFile = File(...)):
    global model
    content = file.file.read()
    df = pd.read_csv(io.BytesIO(content))
    df['log_carbon_emissions'] = np.log(df['carbon_emissions'] + 1)
    X = df[features]
    preds = model.predict(X)
    df['predicted_esg_score'] = preds

    # Merge actual esg_score from reference data using 'company' column
    try:
        ref_df = pd.read_csv(DATA_CSV)
        ref_df = ref_df[['company', 'esg_score']]
        df = df.merge(ref_df, on='company', how='left', suffixes=('', '_actual'))
        df = df.rename(columns={'esg_score': 'actual_esg_score'})
    except Exception:
        # If merge fails, just continue with predicted only
        df['actual_esg_score'] = None

    # Always show company, predicted_esg_score, actual_esg_score first, then the rest
    cols = list(df.columns)
    ordered_cols = []
    for col in ['company', 'predicted_esg_score', 'actual_esg_score']:
        if col in cols:
            ordered_cols.append(col)
    for col in cols:
        if col not in ordered_cols:
            ordered_cols.append(col)
    df = df[ordered_cols]

    # Replace NaN and inf values with None for JSON serialization
    result = df.replace([np.nan, np.inf, -np.inf], None).to_dict(orient='records')
    return result
