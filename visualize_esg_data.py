import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the improved ESG dataset
esg_df = pd.read_csv('src/data/esg_data.csv')

# Bar chart: Mean ESG score by industry
def plot_esg_by_industry():
    plt.figure(figsize=(8, 5))
    industry_means = esg_df.groupby('industry')['esg_score'].mean().sort_values()
    sns.barplot(x=industry_means.values, y=industry_means.index, palette='viridis')
    plt.xlabel('Mean ESG Score')
    plt.ylabel('Industry')
    plt.title('Mean ESG Score by Industry')
    plt.tight_layout()
    plt.show()

# Correlation heatmap
def plot_correlation_heatmap():
    plt.figure(figsize=(8, 6))
    corr = esg_df[['environmental_score','social_score','governance_score','esg_score','carbon_emissions','employee_satisfaction','board_diversity','controversies']].corr()
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt='.2f')
    plt.title('Correlation Heatmap of ESG Features')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    plot_esg_by_industry()
    plot_correlation_heatmap()
