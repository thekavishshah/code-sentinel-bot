import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RiskAssessmentProps {
  pr: any;
}

export const RiskAssessment = ({ pr }: RiskAssessmentProps) => {
  const riskFactors = [
    {
      name: 'Security Vulnerabilities',
      score: pr.checks.security > 0 ? 85 : 20,
      trend: pr.checks.security > 0 ? 'up' : 'down',
      description: pr.checks.security > 0 ? `${pr.checks.security} security issues found` : 'No security issues detected'
    },
    {
      name: 'Code Complexity',
      score: pr.filesChanged > 10 ? 70 : pr.filesChanged > 5 ? 45 : 25,
      trend: pr.filesChanged > 10 ? 'up' : 'down',
      description: `${pr.filesChanged} files modified with ${pr.additions + pr.deletions} total changes`
    },
    {
      name: 'Test Coverage Impact',
      score: pr.checks.testCoverage < 70 ? 80 : pr.checks.testCoverage < 85 ? 50 : 20,
      trend: pr.checks.testCoverage < 70 ? 'up' : 'down',
      description: `Current coverage: ${pr.checks.testCoverage}%`
    },
    {
      name: 'Merge Conflicts',
      score: pr.checks.conflicts ? 90 : 15,
      trend: pr.checks.conflicts ? 'up' : 'down',
      description: pr.checks.conflicts ? 'Active merge conflicts detected' : 'No merge conflicts'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {riskFactors.map((factor, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div
                  className="space-y-2 cursor-pointer border border-transparent rounded-lg transition-colors hover:border-purple-500 focus:border-purple-600 outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label={`Show details for ${factor.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{factor.name}</span>
                      {getTrendIcon(factor.trend)}
                    </div>
                    <span className={`font-semibold text-sm ${getScoreColor(factor.score)}`}>
                      {factor.score}%
                    </span>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                  <p className="text-xs text-gray-500">{factor.description}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{factor.name} Details</DialogTitle>
                  <DialogDescription>
                    <div className="mt-2 text-sm text-gray-700">
                      <p><strong>Score:</strong> {factor.score}%</p>
                      <p><strong>Description:</strong> {factor.description}</p>
                      <p className="mt-2 italic text-purple-700">(Detailed information about {factor.name} will appear here.)</p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Overall Risk Score</span>
              <span className={`text-lg font-bold ${getScoreColor(pr.riskScore)}`}>
                {pr.riskScore}%
              </span>
            </div>
            <Progress value={pr.riskScore} className="h-3" />
            <p className="text-xs text-gray-500 mt-2">
              {pr.riskScore >= 80 ? 'High risk - requires careful review' : pr.riskScore >= 50 ? 'Medium risk - standard review recommended' : 'Low risk - automated merge candidate'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
