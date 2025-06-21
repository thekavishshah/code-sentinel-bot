
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Lock, Code } from 'lucide-react';

interface SecurityAlertProps {
  issue: {
    type: string;
    file: string;
    line: number;
    severity: string;
  };
}

export const SecurityAlert = ({ issue }: SecurityAlertProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'hardcoded_secret':
        return Lock;
      case 'sql_injection':
        return Shield;
      case 'weak_crypto':
        return Code;
      default:
        return AlertTriangle;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'hardcoded_secret':
        return 'Hardcoded Secret Detected';
      case 'sql_injection':
        return 'SQL Injection Vulnerability';
      case 'weak_crypto':
        return 'Weak Cryptographic Implementation';
      default:
        return 'Security Issue';
    }
  };

  const getDescription = (type: string) => {
    switch (type) {
      case 'hardcoded_secret':
        return 'A secret key or credential is hardcoded in the source code. This poses a significant security risk.';
      case 'sql_injection':
        return 'The code appears vulnerable to SQL injection attacks. User input should be properly sanitized.';
      case 'weak_crypto':
        return 'The cryptographic implementation uses outdated or weak algorithms that may be compromised.';
      default:
        return 'A security vulnerability has been detected in the code.';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const Icon = getIcon(issue.type);

  return (
    <Card className={`border-l-4 ${issue.severity === 'critical' || issue.severity === 'high' ? 'border-l-red-500' : issue.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-100' : issue.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
            <Icon className={`w-5 h-5 ${issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-600' : issue.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{getTitle(issue.type)}</h4>
              <Badge className={getSeverityColor(issue.severity)}>
                {issue.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">{getDescription(issue.type)}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>📁 {issue.file}</span>
              <span>📍 Line {issue.line}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
