import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, X, FileText, Percent, GitMerge } from 'lucide-react';

interface RiskAssessmentProps {
  pr: any;
}

export const RiskAssessment = ({ pr }: RiskAssessmentProps) => {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showComplexityModal, setShowComplexityModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

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

  const handleSecurityClick = () => {
    if (pr.checks.security > 0) {
      setShowSecurityModal(true);
    }
  };

  const handleComplexityClick = () => {
    if (pr.filesChanged > 0) {
      setShowComplexityModal(true);
    }
  };

  const handleCoverageClick = () => {
    setShowCoverageModal(true);
  };

  const handleConflictClick = () => {
    if (pr.checks.conflicts) {
      setShowConflictModal(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {riskFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
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
                <p
                  className={`text-xs text-gray-500 ${
                    (factor.name === 'Security Vulnerabilities' && pr.checks.security > 0) ||
                    (factor.name === 'Code Complexity' && pr.filesChanged > 0) ||
                    factor.name === 'Test Coverage Impact' ||
                    (factor.name === 'Merge Conflicts' && pr.checks.conflicts)
                      ? 'cursor-pointer hover:text-red-600 hover:underline font-medium'
                      : ''
                  }`}
                  onClick={
                    factor.name === 'Security Vulnerabilities'
                      ? handleSecurityClick
                      : factor.name === 'Code Complexity'
                      ? handleComplexityClick
                      : factor.name === 'Test Coverage Impact'
                      ? handleCoverageClick
                      : factor.name === 'Merge Conflicts'
                      ? handleConflictClick
                      : undefined
                  }
                >
                  {factor.description}
                </p>
              </div>
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
                    <span className={`text-xs px-2 py-1 rounded ${
                      issue.severity === 'critical' ? 'bg-red-600 text-white' :
                      issue.severity === 'high' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {issue.severity}
                    </span>
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

      {/* Code Complexity Modal */}
      {showComplexityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Code Complexity Details</h3>
              <button 
                onClick={() => setShowComplexityModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Breakdown of the {pr.filesChanged} files changed in this pull request:
              </p>
              {pr.changedFiles?.map((file: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm text-gray-800">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600 font-medium">+{file.additions}</span>
                      <span className="text-red-600 font-medium">-{file.deletions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowComplexityModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Coverage Modal */}
      {showCoverageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Coverage Details</h3>
              <button 
                onClick={() => setShowCoverageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Overall test coverage for this pull request is {pr.checks.testCoverage}%. Here's the breakdown:
              </p>
              {pr.testCoverageDetails?.map((detail: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm text-gray-800">{detail.file}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`font-medium ${detail.status === 'increased' ? 'text-green-600' : 'text-red-600'}`}>
                        {detail.coverage}
                      </span>
                      {detail.status === 'increased' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowCoverageModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Conflicts Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Merge Conflict Details</h3>
              <button 
                onClick={() => setShowConflictModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The following files have conflicts between <code className="bg-gray-200 px-1 rounded">{pr.conflictDetails[0].base_branch}</code> and <code className="bg-gray-200 px-1 rounded">{pr.conflictDetails[0].head_branch}</code>:
              </p>
              {pr.conflictDetails?.map((conflict: any, index: number) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <GitMerge className="w-4 h-4 text-red-500" />
                    <span className="font-mono text-sm text-red-800">{conflict.file}</span>
                  </div>
                  <pre className="bg-gray-900 text-white p-3 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>{conflict.conflict_preview}</code>
                  </pre>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowConflictModal(false)}
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
