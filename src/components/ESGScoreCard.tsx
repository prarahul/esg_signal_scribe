import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/esg';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ESGScoreCardProps {
  company: Company;
  industryBenchmark?: number;
}

export function ESGScoreCard({ company, industryBenchmark = 65 }: ESGScoreCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'High': return 'bg-danger text-danger-foreground';
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getTrendIcon = (score: number) => {
    if (score > industryBenchmark) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (score < industryBenchmark) {
      return <TrendingDown className="h-4 w-4 text-danger" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{company.name}</CardTitle>
          <Badge className={getRiskColor(company.riskLevel)}>
            {company.riskLevel} Risk
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {company.symbol} • {company.sector}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall ESG Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(company.esgScore)}`}>
            {company.esgScore}
          </div>
          <div className="text-sm text-muted-foreground">ESG Risk Score</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {getTrendIcon(company.esgScore)}
            <span className="text-xs text-muted-foreground">
              vs Industry ({industryBenchmark})
            </span>
          </div>
        </div>

        {/* Individual Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-esg-environmental">
              {company.environmentalScore}
            </div>
            <div className="text-xs text-muted-foreground">Environmental</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-esg-social">
              {company.socialScore}
            </div>
            <div className="text-xs text-muted-foreground">Social</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-esg-governance">
              {company.governanceScore}
            </div>
            <div className="text-xs text-muted-foreground">Governance</div>
          </div>
        </div>

        {/* Market Cap */}
        <div className="text-center pt-2 border-t">
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="font-medium">
            ${(company.marketCap / 1000).toFixed(0)}B
          </div>
        </div>
      </CardContent>
    </Card>
  );
}