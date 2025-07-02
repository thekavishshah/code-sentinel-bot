
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
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const Icon = getIcon(issue.type);

  return (
    <Card className={`bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20 border-l-4 ${issue.severity === 'critical' || issue.severity === 'high' ? 'border-l-red-500' : issue.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl ${issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-500/20 border border-red-500/30' : issue.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
            <Icon className={`w-5 h-5 ${issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-400' : issue.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{getTitle(issue.type)}</h4>
              <Badge className={`border ${getSeverityColor(issue.severity)}`}>
                {issue.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">{getDescription(issue.type)}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">📁 {issue.file}</span>
              <span className="flex items-center">📍 Line {issue.line}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
