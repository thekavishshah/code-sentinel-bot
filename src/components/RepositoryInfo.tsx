
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
    <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Github className="w-5 h-5 mr-2 text-cyan-400" />
            Repository Analysis
          </div>
          <a 
            href={repository.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:scale-110"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white break-words">
              {repository.owner}/<span className="text-cyan-400">{repository.name}</span>
            </h3>
            <p className="text-sm text-gray-400 font-mono break-all">{repository.url}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10">
              {repository.language}
            </Badge>
            <Badge variant="outline" className="flex items-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-lg shadow-yellow-500/10">
              <Star className="w-3 h-3 mr-1" />
              {repository.stars}
            </Badge>
            <Badge variant="outline" className="flex items-center bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <GitFork className="w-3 h-3 mr-1" />
              {repository.forks}
            </Badge>
            <Badge variant="outline" className="flex items-center bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/10">
              <GitPullRequest className="w-3 h-3 mr-1" />
              {repository.openPRs} Open PRs
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
