
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, AlertTriangle, GitMerge, TestTube, Code, Shield } from 'lucide-react';

interface PRAnalysisCardProps {
  pr: any;
}

export const PRAnalysisCard = ({ pr }: PRAnalysisCardProps) => {
  const checkItems = [
    {
      label: 'Merge Conflicts',
      status: pr.checks.conflicts ? 'failed' : 'passed',
      icon: GitMerge,
      detail: pr.checks.conflicts ? 'Conflicts detected' : 'No conflicts'
    },
    {
      label: 'Test Coverage',
      status: pr.checks.testCoverage >= 80 ? 'passed' : pr.checks.testCoverage >= 60 ? 'warning' : 'failed',
      icon: TestTube,
      detail: `${pr.checks.testCoverage}% coverage`
    },
    {
      label: 'Code Quality',
      status: pr.checks.linting ? 'passed' : 'failed',
      icon: Code,
      detail: pr.checks.linting ? 'All checks passed' : 'Linting issues found'
    },
    {
      label: 'Security Scan',
      status: pr.checks.security === 0 ? 'passed' : pr.checks.security <= 2 ? 'warning' : 'failed',
      icon: Shield,
      detail: pr.checks.security === 0 ? 'No issues found' : `${pr.checks.security} issues found`
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.status)}
                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
