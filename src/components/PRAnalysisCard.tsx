import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, AlertTriangle, GitMerge, TestTube, Code, Shield } from 'lucide-react';

interface PRAnalysisCardProps {
  pr: any;
}

export const PRAnalysisCard = ({ pr }: PRAnalysisCardProps) => {
  const [showSecurityModal, setShowSecurityModal] = useState(false);

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

  const handleSecurityClick = () => {
    if (pr.checks.security > 0) {
      setShowSecurityModal(true);
    }
  };

  return (
    <>
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
                  <Badge 
                    className={`text-xs ${getStatusColor(item.status)} ${
                      item.label === 'Security Scan' && pr.checks.security > 0 
                        ? 'cursor-pointer hover:bg-red-200 hover:text-red-900 hover:underline' 
                        : ''
                    }`}
                    onClick={item.label === 'Security Scan' ? handleSecurityClick : undefined}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Issues Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Security Issues Found</h3>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {pr.securityIssues.map((issue: any, index: number) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-800 capitalize">
                      {issue.type.replace('_', ' ')}
                    </h4>
                    <Badge className={`text-xs ${
                      issue.severity === 'critical' ? 'bg-red-600 text-white' :
                      issue.severity === 'high' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-700 mb-3">
                    <p><strong>File:</strong> {issue.file}</p>
                    <p><strong>Line:</strong> {issue.line}</p>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                    <div className="text-gray-500 mb-2">Code Preview:</div>
                    <div>Line {issue.line}: // Security vulnerability detected</div>
                    <div className="text-red-400">// {issue.type.replace('_', ' ')} - {issue.severity} severity</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
