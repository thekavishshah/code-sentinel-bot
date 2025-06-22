import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GitMerge, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  Shield, 
  Clock,
  ArrowRight,
  Send,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationPanelProps {
  pr: any;
}

export const RecommendationPanel = ({ pr }: RecommendationPanelProps) => {
  const { toast } = useToast();
  const [requestedReviewers, setRequestedReviewers] = useState<string[]>([]);
  const [loadingReviewers, setLoadingReviewers] = useState<string[]>([]);

  const handleRequestReview = async (reviewer: any) => {
    setLoadingReviewers([...loadingReviewers, reviewer.name]);
    try {
      const { error } = await supabase.functions.invoke('request-review', {
        body: { 
          owner: pr.owner,
          repo: pr.repo,
          pull_number: pr.number,
          reviewer: reviewer.githubUsername
        }
      });

      if (error) throw error;

      setRequestedReviewers([...requestedReviewers, reviewer.name]);
      toast({
        title: "Review Request Sent",
        description: `A real GitHub notification has been sent to ${reviewer.name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send Request",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoadingReviewers(prev => prev.filter(name => name !== reviewer.name));
    }
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (pr.checks.security > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Fix Security Vulnerabilities',
        description: `Address ${pr.checks.security} security issue${pr.checks.security > 1 ? 's' : ''} before merging`,
        action: 'Review Security Tab',
        icon: Shield,
        automated: false
      });
    }

    if (pr.checks.conflicts) {
      recommendations.push({
        type: 'conflicts',
        priority: 'high',
        title: 'Resolve Merge Conflicts',
        description: 'Conflicts must be resolved before this PR can be merged',
        action: 'Auto-resolve Conflicts',
        icon: GitMerge,
        automated: true
      });
    }

    if (pr.checks.testCoverage < 80) {
      recommendations.push({
        type: 'testing',
        priority: 'medium',
        title: 'Improve Test Coverage',
        description: `Current coverage is ${pr.checks.testCoverage}%. Aim for 80%+ coverage`,
        action: 'Generate Test Cases',
        icon: Code,
        automated: true
      });
    }

    if (!pr.checks.linting) {
      recommendations.push({
        type: 'quality',
        priority: 'low',
        title: 'Fix Code Quality Issues',
        description: 'Linting errors detected that should be addressed',
        action: 'Auto-fix Linting',
        icon: Code,
        automated: true
      });
    }

    if (pr.riskScore >= 70) {
      recommendations.push({
        type: 'review',
        priority: 'high',
        title: 'Request Additional Review',
        description: 'High-risk changes require senior developer review',
        action: 'Assign Reviewers',
        icon: Users,
        automated: false
      });
    }

    return recommendations;
  };

  const suggestedReviewers = [
    {
      name: 'Sarah Chen',
      role: 'Senior Security Engineer',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      reason: 'Security expertise',
      githubUsername: 'sarahc'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Database Architect',
      avatar: 'https://i.pravatar.cc/150?u=mike',
      reason: 'Database changes',
      githubUsername: 'mikerod'
    },
    {
      name: 'Alex Kim',
      role: 'DevOps Lead',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      reason: 'Infrastructure impact',
      githubUsername: 'alexk'
    }
  ];

  const recommendations = getRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDecision = () => {
    if (pr.status === 'blocked') {
      return {
        title: 'Merge Blocked',
        description: 'Critical issues must be resolved before merging',
        action: 'Block Merge',
        color: 'bg-red-600 hover:bg-red-700',
        icon: AlertTriangle
      };
    } else if (pr.status === 'risky') {
      return {
        title: 'Requires Review',
        description: 'Manual review recommended before merging',
        action: 'Request Review',
        color: 'bg-yellow-600 hover:bg-yellow-700',
        icon: Clock
      };
    } else {
      return {
        title: 'Safe to Merge',
        description: 'All checks passed, ready for merge',
        action: 'Approve & Merge',
        color: 'bg-green-600 hover:bg-green-700',
        icon: CheckCircle
      };
    }
  };

  const decision = getStatusDecision();
  const DecisionIcon = decision.icon;

  return (
    <div className="space-y-6">
      {/* Decision Card */}
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${decision.color} text-white`}>
                <DecisionIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
                <p className="text-gray-600">{decision.description}</p>
              </div>
            </div>
            <Button className={`${decision.color} text-white`}>
              {decision.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <rec.icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </Badge>
                        {rec.automated && (
                          <Badge variant="outline" className="text-xs">
                            Auto-fix
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{rec.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="bg-gray-100 text-gray-800">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Reviewers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Suggested Reviewers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedReviewers.map((reviewer, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <img src={reviewer.avatar} alt={reviewer.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="font-medium text-sm">{reviewer.name}</h4>
                    <p className="text-xs text-gray-500">{reviewer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">{reviewer.reason}</p>
                  {requestedReviewers.includes(reviewer.name) ? (
                    <Button size="sm" variant="outline" disabled className="bg-green-100 text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Requested
                    </Button>
                  ) : loadingReviewers.includes(reviewer.name) ? (
                    <Button size="sm" variant="outline" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-100 text-gray-800"
                      onClick={() => handleRequestReview(reviewer)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Request Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
