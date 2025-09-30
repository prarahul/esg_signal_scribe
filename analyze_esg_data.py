import pandas as pd
from sklearn.metrics import mean_squared_error

# Load the improved ESG dataset
esg_df = pd.read_csv('src/data/esg_data.csv')

# Show the first few rows
def show_head():
    print('First 5 rows:')
    print(esg_df.head())

# Basic statistics
def show_stats():
    print('\nSummary statistics:')
    print(esg_df.describe())

# Group by industry and show mean ESG score
def industry_means():
    print('\nMean ESG score by industry:')
    print(esg_df.groupby('industry')['esg_score'].mean())

# Test RMSE calculation (assuming y_test and y_pred are defined)
def test_rmse(y_test, y_pred):
    print('Test RMSE:', mean_squared_error(y_test, y_pred, squared=False))

if __name__ == '__main__':
    show_head()
    show_stats()
    industry_means()
