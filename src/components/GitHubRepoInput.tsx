
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, Github, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Calling analyze-repository function...');
      
      const { data, error: functionError } = await supabase.functions.invoke('analyze-repository', {
        body: { repoUrl: repoUrl.trim() }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to analyze repository');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Analysis completed:', data);
      onRepositoryAnalyzed(data);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze repository. Please try again.');
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
          <p className="mb-2">Enter a GitHub repository URL to analyze its pull requests with real AI-powered security analysis.</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Real GitHub API
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Claude AI Analysis
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live Security Scan
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
