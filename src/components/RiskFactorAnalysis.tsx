import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ESGRiskFactor } from '@/types/esg';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface RiskFactorAnalysisProps {
  riskFactors: ESGRiskFactor[];
}

export function RiskFactorAnalysis({ riskFactors }: RiskFactorAnalysisProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'negative': return <AlertTriangle className="h-4 w-4 text-danger" />;
      default: return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Environmental': return 'bg-esg-environmental text-white';
      case 'Social': return 'bg-esg-social text-white';
      case 'Governance': return 'bg-esg-governance text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactWidth = (impact: number) => {
    return `${impact * 100}%`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Risk Factor Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskFactors.map((factor, index) => (
          <div key={index} className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(factor.category)}>
                  {factor.category}
                </Badge>
                {getSentimentIcon(factor.sentiment)}
              </div>
              <div className="text-sm font-medium">
                Impact: {(factor.impact * 100).toFixed(0)}%
              </div>
            </div>
            
            <h4 className="font-medium mb-1">{factor.factor}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {factor.description}
            </p>
            
            {/* Impact Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  factor.sentiment === 'negative' ? 'bg-danger' :
                  factor.sentiment === 'positive' ? 'bg-success' : 'bg-warning'
                }`}
                style={{ width: getImpactWidth(factor.impact) }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}