
import React, { useState } from 'react';
import { GitPullRequest, Shield, AlertTriangle, CheckCircle, X, Users, FileText, Code, Lock, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PRAnalysisCard } from '@/components/PRAnalysisCard';
import { SecurityAlert } from '@/components/SecurityAlert';
import { RiskAssessment } from '@/components/RiskAssessment';
import { RecommendationPanel } from '@/components/RecommendationPanel';
import { GitHubRepoInput } from '@/components/GitHubRepoInput';
import { RepositoryInfo } from '@/components/RepositoryInfo';

const Index = () => {
  const [selectedPR, setSelectedPR] = useState(0);
  const [currentRepository, setCurrentRepository] = useState<any>(null);
  const [currentPRs, setCurrentPRs] = useState<any[]>([]);
  
  // Default mock PRs for demo
  const defaultMockPRs = [
    {
      id: 1,
      title: "Add user authentication with JWT tokens",
      author: "alex_dev",
      status: "risky",
      filesChanged: 12,
      additions: 245,
      deletions: 67,
      riskScore: 75,
      checks: {
        conflicts: false,
        testCoverage: 85,
        linting: true,
        security: 2,
        semanticRisk: "medium"
      },
      securityIssues: [
        { type: "hardcoded_secret", file: "auth.js", line: 23, severity: "high" },
        { type: "weak_crypto", file: "jwt.js", line: 45, severity: "medium" }
      ],
      aiSummary: "This PR introduces JWT authentication but contains security vulnerabilities. The hardcoded secret key poses a significant risk. Code structure is well-organized but needs security improvements."
    },
    {
      id: 2,
      title: "Fix responsive design for mobile dashboard",
      author: "sarah_ui",
      status: "safe",
      filesChanged: 4,
      additions: 89,
      deletions: 23,
      riskScore: 25,
      checks: {
        conflicts: false,
        testCoverage: 92,
        linting: true,
        security: 0,
        semanticRisk: "low"
      },
      securityIssues: [],
      aiSummary: "Low-risk UI changes that improve mobile experience. No security concerns, good test coverage, and follows established patterns."
    },
    {
      id: 3,
      title: "Refactor database connection pool",
      author: "mike_backend",
      status: "blocked",
      filesChanged: 8,
      additions: 156,
      deletions: 203,
      riskScore: 95,
      checks: {
        conflicts: true,
        testCoverage: 45,
        linting: false,
        security: 1,
        semanticRisk: "high"
      },
      securityIssues: [
        { type: "sql_injection", file: "database.js", line: 78, severity: "critical" }
      ],
      aiSummary: "High-risk database changes with merge conflicts and critical security vulnerabilities. Requires immediate attention and additional review."
    }
  ];

  // Use current PRs if available, otherwise use default
  const mockPRs = currentPRs.length > 0 ? currentPRs : defaultMockPRs;
  const currentPR = mockPRs[selectedPR];

  const handleRepositoryAnalyzed = (repoData: any) => {
    setCurrentRepository(repoData.repository);
    setCurrentPRs(repoData.pullRequests);
    setSelectedPR(0); // Select first PR
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PR Guardian AI</h1>
                <p className="text-sm text-gray-600">Intelligent Pull Request Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Connect GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* GitHub Repository Input */}
        {!currentRepository && (
          <div className="mb-8">
            <GitHubRepoInput onRepositoryAnalyzed={handleRepositoryAnalyzed} />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* PR List Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-4">
              {currentRepository && (
                <RepositoryInfo repository={currentRepository} />
              )}
              
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <GitPullRequest className="w-5 h-5 mr-2" />
                    {currentRepository ? `${currentRepository.name} PRs` : 'Active PRs'}
                  </CardTitle>
                  {currentRepository && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setCurrentRepository(null);
                        setCurrentPRs([]);
                        setSelectedPR(0);
                      }}
                      className="text-xs"
                    >
                      Analyze Different Repo
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockPRs.map((pr, index) => (
                    <div
                      key={pr.id}
                      onClick={() => setSelectedPR(index)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedPR === index 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={pr.status === 'safe' ? 'default' : pr.status === 'risky' ? 'secondary' : 'destructive'}
                          className={
                            pr.status === 'safe' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : pr.status === 'risky' 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {pr.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">#{pr.id}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{pr.title}</h4>
                      <p className="text-xs text-gray-500">by {pr.author}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{pr.filesChanged} files</span>
                        <span className="flex items-center">
                          Risk: {pr.riskScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="space-y-6">
              {/* PR Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold">{currentPR.title}</h2>
                        <Badge
                          variant={currentPR.status === 'safe' ? 'default' : currentPR.status === 'risky' ? 'secondary' : 'destructive'}
                          className={`${
                            currentPR.status === 'safe' 
                              ? 'bg-green-100 text-green-800' 
                              : currentPR.status === 'risky' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          } text-sm px-3`}
                        >
                          {currentPR.status === 'safe' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {currentPR.status === 'risky' && <AlertTriangle className="w-4 h-4 mr-1" />}
                          {currentPR.status === 'blocked' && <X className="w-4 h-4 mr-1" />}
                          {currentPR.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-600">PR #{currentPR.id} by {currentPR.author}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {currentPR.riskScore}%
                      </div>
                      <p className="text-sm text-gray-500">Risk Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">+{currentPR.additions}</div>
                      <p className="text-sm text-gray-500">Additions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">-{currentPR.deletions}</div>
                      <p className="text-sm text-gray-500">Deletions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{currentPR.filesChanged}</div>
                      <p className="text-sm text-gray-500">Files Changed</p>
                    </div>
                  </div>
                  <Progress value={currentPR.riskScore} className="h-2" />
                </CardContent>
              </Card>

              {/* Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="recommendations">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PRAnalysisCard pr={currentPR} />
                    <RiskAssessment pr={currentPR} />
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  {currentPR.securityIssues.length > 0 ? (
                    currentPR.securityIssues.map((issue, index) => (
                      <SecurityAlert key={index} issue={issue} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Security Issues Found</h3>
                          <p className="text-gray-600">This PR passed all security checks successfully.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="w-5 h-5 mr-2" />
                        AI-Powered Code Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">{currentPR.aiSummary}</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Key Insights</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Code complexity analysis shows moderate changes to critical authentication flow</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Semantic similarity check with existing patterns shows 78% consistency</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Impact analysis suggests potential breaking changes for legacy clients</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations">
                  <RecommendationPanel pr={currentPR} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
