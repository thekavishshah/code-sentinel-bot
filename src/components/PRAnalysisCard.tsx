
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


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-white">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.status)}
                <Badge className={`text-xs border ${getStatusColor(item.status)}`}>
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
