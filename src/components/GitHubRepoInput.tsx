
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
    <Card className="w-full bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Github className="w-6 h-6 mr-3 text-cyan-400" />
          Real-Time GitHub Repository Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-3">
          <Input
            placeholder="https://github.com/facebook/react"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              setError('');
            }}
            className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/25"
            disabled={isAnalyzing}
          />
          <Button 
            onClick={analyzeRepository}
            disabled={isAnalyzing || !repoUrl.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105 px-6"
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
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        <div className="text-sm">
          <p className="mb-4 text-gray-300 leading-relaxed">Enter any public GitHub repository URL to perform real-time AI-powered security analysis of its pull requests.</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live GitHub API
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10">
              <CheckCircle className="w-3 h-3 mr-1" />
              Claude AI Analysis
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/10">
              <CheckCircle className="w-3 h-3 mr-1" />
              Real Security Scanning
            </Badge>
          </div>
          <div className="text-xs space-y-2">
            <p className="flex items-center text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
              <ExternalLink className="w-3 h-3 mr-2" />
              Try: https://github.com/facebook/react
            </p>
            <p className="flex items-center text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
              <ExternalLink className="w-3 h-3 mr-2" />
              Try: https://github.com/microsoft/vscode
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
