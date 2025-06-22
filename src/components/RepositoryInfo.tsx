
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitFork, GitPullRequest, ExternalLink } from 'lucide-react';

interface RepositoryInfoProps {
  repository: {
    name: string;
    owner: string;
    url: string;
    language: string;
    stars: number;
    forks: number;
    openPRs: number;
  };
}

export const RepositoryInfo = ({ repository }: RepositoryInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Github className="w-5 h-5 mr-2" />
            Repository Analysis
          </div>
          <a 
            href={repository.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {repository.owner}/{repository.name}
            </h3>
            <p className="text-sm text-gray-600">{repository.url}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {repository.language}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Star className="w-3 h-3 mr-1" />
              {repository.stars}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <GitFork className="w-3 h-3 mr-1" />
              {repository.forks}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <GitPullRequest className="w-3 h-3 mr-1" />
              {repository.openPRs} Open PRs
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
