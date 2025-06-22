
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, Github, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { githubService } from '@/services/githubService';
import { useToast } from '@/hooks/use-toast';

interface GitHubRepoInputProps {
  onRepositoryAnalyzed: (repoData: any) => void;
}

export const GitHubRepoInput = ({ onRepositoryAnalyzed }: GitHubRepoInputProps) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

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
      console.log('Starting GitHub repository analysis with direct API...');
      
      toast({
        title: "Analysis Started",
        description: "Fetching repository data directly from GitHub API...",
      });
      
      const data = await githubService.getDetailedPullRequests(repoUrl.trim());

      console.log('GitHub analysis completed:', data);
      
      if (data.pullRequests && data.pullRequests.length === 0) {
        toast({
          title: "No Open Pull Requests",
          description: "This repository has no open pull requests to analyze.",
          variant: "default",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${data.pullRequests?.length || 0} pull requests with detailed GitHub data.`,
        });
      }
      
      onRepositoryAnalyzed(data);
      
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze repository. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="w-5 h-5 mr-2" />
          Real-Time GitHub Repository Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="https://github.com/facebook/react"
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
                Analyze Repository
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
          <p className="mb-3">Enter any public GitHub repository URL to perform real-time AI-powered security analysis of its pull requests.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live GitHub API
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Claude AI Analysis
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Real Security Scanning
            </Badge>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
              Try: https://github.com/facebook/react
            </p>
            <p className="flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
              Try: https://github.com/microsoft/vscode
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
