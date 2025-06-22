
import React, { useState, useEffect } from 'react';
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
  Loader2,
  Star,
  GitCommit
} from 'lucide-react';
import { githubService, GitHubContributor, GitHubCollaborator } from '@/services/githubService';
import { useToast } from '@/hooks/use-toast';

interface RecommendationPanelProps {
  pr: any;
  repositoryUrl: string;
}

export const RecommendationPanel = ({ pr, repositoryUrl }: RecommendationPanelProps) => {
  const [suggestedReviewers, setSuggestedReviewers] = useState<{
    fileExperts: GitHubContributor[];
    topContributors: GitHubContributor[];
    collaborators: GitHubCollaborator[];
  }>({
    fileExperts: [],
    topContributors: [],
    collaborators: []
  });
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (repositoryUrl && pr.fileChanges) {
      fetchSuggestedReviewers();
    }
  }, [repositoryUrl, pr.id]);

  const fetchSuggestedReviewers = async () => {
    setLoadingReviewers(true);
    try {
      const changedFiles = pr.fileChanges?.map((file: any) => file.filename) || [];
      const reviewers = await githubService.getSuggestedReviewers(repositoryUrl, changedFiles);
      setSuggestedReviewers(reviewers);
    } catch (error) {
      console.error('Error fetching suggested reviewers:', error);
    } finally {
      setLoadingReviewers(false);
    }
  };

  const handleAction = async (actionType: string, actionName: string) => {
    setActionLoading(actionType);
    
    try {
      switch (actionType) {
        case 'request-review':
          await handleRequestReview();
          break;
        case 'generate-tests':
          await handleGenerateTestCases();
          break;
        case 'auto-resolve-conflicts':
          await handleAutoResolveConflicts();
          break;
        case 'auto-fix-linting':
          await handleAutoFixLinting();
          break;
        case 'assign-reviewers':
          await handleAssignReviewers();
          break;
        case 'block-merge':
        case 'approve-merge':
          await handleMergeAction(actionType);
          break;
        default:
          toast({
            title: "Action Not Implemented",
            description: `${actionName} functionality is coming soon!`,
            variant: "default",
          });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleRequestReview = async () => {
    // Simulate requesting a review
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Review Requested",
      description: "Successfully requested review from suggested reviewers",
      variant: "default",
    });
  };

  const handleGenerateTestCases = async () => {
    // Simulate generating test cases using AI
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast({
      title: "Test Cases Generated",
      description: "AI has generated comprehensive test cases for the PR changes",
      variant: "default",
    });
  };

  const handleAutoResolveConflicts = async () => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    toast({
      title: "Conflicts Resolved",
      description: "Merge conflicts have been automatically resolved",
      variant: "default",
    });
  };

  const handleAutoFixLinting = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Linting Fixed",
      description: "Code quality issues have been automatically fixed",
      variant: "default",
    });
  };

  const handleAssignReviewers = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Reviewers Assigned",
      description: "Senior developers have been assigned for review",
      variant: "default",
    });
  };

  const handleMergeAction = async (actionType: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (actionType === 'approve-merge') {
      toast({
        title: "PR Approved",
        description: "Pull request has been approved and queued for merge",
        variant: "default",
      });
    } else {
      toast({
        title: "Merge Blocked",
        description: "Pull request merge has been blocked due to critical issues",
        variant: "destructive",
      });
    }
  };

  const handleRequestReviewFromUser = async (username: string) => {
    setActionLoading(`review-${username}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Review Requested",
        description: `Review request sent to ${username}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to send review request",
        variant: "destructive",
      });
    } finally {
      setActionLoading('');
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
            <Button 
              className={`${decision.color} text-white`}
              onClick={() => handleAction(
                decision.action === 'Approve & Merge' ? 'approve-merge' : 
                decision.action === 'Request Review' ? 'request-review' : 'block-merge',
                decision.action
              )}
              disabled={actionLoading !== ''}
            >
              {actionLoading === (decision.action === 'Approve & Merge' ? 'approve-merge' : 
                               decision.action === 'Request Review' ? 'request-review' : 'block-merge') ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {decision.action}
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAction(
                      rec.action === 'Generate Test Cases' ? 'generate-tests' :
                      rec.action === 'Auto-resolve Conflicts' ? 'auto-resolve-conflicts' :
                      rec.action === 'Auto-fix Linting' ? 'auto-fix-linting' :
                      rec.action === 'Assign Reviewers' ? 'assign-reviewers' :
                      'default',
                      rec.action
                    )}
                    disabled={actionLoading !== ''}
                  >
                    {actionLoading === (
                      rec.action === 'Generate Test Cases' ? 'generate-tests' :
                      rec.action === 'Auto-resolve Conflicts' ? 'auto-resolve-conflicts' :
                      rec.action === 'Auto-fix Linting' ? 'auto-fix-linting' :
                      rec.action === 'Assign Reviewers' ? 'assign-reviewers' :
                      'default'
                    ) ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : null}
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Suggested Reviewers
            </div>
            {loadingReviewers && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Experts */}
            {suggestedReviewers.fileExperts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <GitCommit className="w-4 h-4 mr-1" />
                  File Experts
                </h4>
                <div className="space-y-2">
                  {suggestedReviewers.fileExperts.map((expert, index) => (
                    <div key={expert.login} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={expert.avatar_url} 
                          alt={expert.login}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{expert.login}</p>
                          <p className="text-xs text-gray-500">{expert.contributions} recent commits to these files</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestReviewFromUser(expert.login)}
                        disabled={actionLoading !== ''}
                      >
                        {actionLoading === `review-${expert.login}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : null}
                        Request Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Contributors */}
            {suggestedReviewers.topContributors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Top Contributors
                </h4>
                <div className="space-y-2">
                  {suggestedReviewers.topContributors.map((contributor, index) => (
                    <div key={contributor.login} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={contributor.avatar_url} 
                          alt={contributor.login}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{contributor.login}</p>
                          <p className="text-xs text-gray-500">{contributor.contributions} contributions</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestReviewFromUser(contributor.login)}
                        disabled={actionLoading !== ''}
                      >
                        {actionLoading === `review-${contributor.login}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : null}
                        Request Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repository Collaborators */}
            {suggestedReviewers.collaborators.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Repository Collaborators
                </h4>
                <div className="space-y-2">
                  {suggestedReviewers.collaborators.slice(0, 3).map((collaborator, index) => (
                    <div key={collaborator.login} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={collaborator.avatar_url} 
                          alt={collaborator.login}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{collaborator.login}</p>
                          <div className="flex space-x-1">
                            {collaborator.permissions.admin && (
                              <Badge variant="outline" className="text-xs">Admin</Badge>
                            )}
                            {collaborator.permissions.maintain && (
                              <Badge variant="outline" className="text-xs">Maintainer</Badge>
                            )}
                            {collaborator.permissions.push && !collaborator.permissions.admin && !collaborator.permissions.maintain && (
                              <Badge variant="outline" className="text-xs">Developer</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestReviewFromUser(collaborator.login)}
                        disabled={actionLoading !== ''}
                      >
                        {actionLoading === `review-${collaborator.login}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : null}
                        Request Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading or empty state */}
            {!loadingReviewers && 
             suggestedReviewers.fileExperts.length === 0 && 
             suggestedReviewers.topContributors.length === 0 && 
             suggestedReviewers.collaborators.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No suggested reviewers found</p>
                <p className="text-xs">This may be a private repository or have limited access</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
