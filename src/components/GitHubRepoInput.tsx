
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, Github, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface GitHubRepoInputProps {
  onRepositoryAnalyzed: (repoData: any) => void;
}

export const GitHubRepoInput = ({ onRepositoryAnalyzed }: GitHubRepoInputProps) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyzeRepository = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(repoUrl.trim())) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Extract owner and repo from URL
      const urlParts = repoUrl.trim().replace(/\/$/, '').split('/');
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];

      // Simulate API call to analyze repository
      // In a real implementation, this would call GitHub API and your analysis service
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis data based on repository
      const mockAnalysisData = {
        repository: {
          name: repo,
          owner: owner,
          url: repoUrl,
          language: 'JavaScript',
          stars: Math.floor(Math.random() * 1000),
          forks: Math.floor(Math.random() * 100),
          openPRs: Math.floor(Math.random() * 10) + 1
        },
        pullRequests: [
          {
            id: 1,
            title: `Fix authentication bug in ${repo}`,
            author: "contributor_1",
            status: "risky",
            filesChanged: Math.floor(Math.random() * 15) + 5,
            additions: Math.floor(Math.random() * 200) + 50,
            deletions: Math.floor(Math.random() * 100) + 20,
            riskScore: Math.floor(Math.random() * 40) + 60,
            checks: {
              conflicts: Math.random() > 0.7,
              testCoverage: Math.floor(Math.random() * 30) + 70,
              linting: Math.random() > 0.3,
              security: Math.floor(Math.random() * 3),
              semanticRisk: "medium"
            },
            securityIssues: Math.random() > 0.5 ? [
              { type: "hardcoded_secret", file: "config.js", line: 23, severity: "high" }
            ] : [],
            aiSummary: `This PR addresses critical authentication issues in ${repo}. Code quality is good but requires security review.`
          },
          {
            id: 2,
            title: `Update dependencies in ${repo}`,
            author: "maintainer",
            status: "safe",
            filesChanged: Math.floor(Math.random() * 5) + 2,
            additions: Math.floor(Math.random() * 100) + 30,
            deletions: Math.floor(Math.random() * 50) + 10,
            riskScore: Math.floor(Math.random() * 30) + 10,
            checks: {
              conflicts: false,
              testCoverage: Math.floor(Math.random() * 20) + 80,
              linting: true,
              security: 0,
              semanticRisk: "low"
            },
            securityIssues: [],
            aiSummary: `Routine dependency updates for ${repo}. All checks pass, safe to merge.`
          }
        ]
      };

      onRepositoryAnalyzed(mockAnalysisData);
    } catch (err) {
      setError('Failed to analyze repository. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="w-5 h-5 mr-2" />
          Analyze GitHub Repository
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="https://github.com/owner/repository"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              setError('');
            }}
            className="flex-1"
            disabled={isAnalyzing}
          />
          <Button 
            onClick={analyzeRepository}
            disabled={isAnalyzing || !repoUrl.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <GitPullRequest className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p className="mb-2">Enter a GitHub repository URL to analyze its pull requests and security status.</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Security Analysis
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Code Quality
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Risk Assessment
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
