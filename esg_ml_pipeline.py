import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# 1. Load and clean data
def load_and_clean():
    df = pd.read_csv('src/data/esg_data.csv')
    # Example cleaning: fill missing values (if any)
    df = df.fillna(df.mean(numeric_only=True))
    # Example transformation: log-transform carbon_emissions
    df['log_carbon_emissions'] = (df['carbon_emissions'] + 1).apply(np.log)
    return df

# 2. Train/test split and model training
def train_model(df):
    features = ['environmental_score','social_score','governance_score','log_carbon_emissions','employee_satisfaction','board_diversity','controversies']
    X = df[features]
    y = df['esg_score']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print('Test RMSE:', np.sqrt(mean_squared_error(y_test, y_pred)))
    print('Test R2:', r2_score(y_test, y_pred))
    return model, X_test, y_test, y_pred

# 3. Export predictions
def export_results(X_test, y_test, y_pred):
    results = X_test.copy()
    results['actual_esg_score'] = y_test
    results['predicted_esg_score'] = y_pred
    results.to_csv('src/data/esg_predictions.csv', index=False)
    print('Predictions exported to src/data/esg_predictions.csv')

if __name__ == '__main__':
    df = load_and_clean()
    model, X_test, y_test, y_pred = train_model(df)
    export_results(X_test, y_test, y_pred)
