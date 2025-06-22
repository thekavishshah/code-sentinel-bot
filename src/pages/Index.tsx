import React, { useState, useEffect } from 'react';
import { GitPullRequest, Shield, AlertTriangle, CheckCircle, X, Users, FileText, Code, Lock, Brain, History } from 'lucide-react';
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
import { AnalyzationHistory } from '@/components/AnalyzationHistory';
import { RAGChatbot } from '@/components/RAGChatbot';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedPR, setSelectedPR] = useState(0);
  const [currentRepository, setCurrentRepository] = useState<any>(null);
  const [currentPRs, setCurrentPRs] = useState<any[]>([]);
  const [analyzationHistory, setAnalyzationHistory] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Show message when no repository is selected
  const showEmptyState = !currentRepository;
  
  // Use current PRs if available, otherwise empty array
  const mockPRs = currentPRs.length > 0 ? currentPRs : [];
  const currentPR = mockPRs[selectedPR];
  
  // Debug current PR data
  React.useEffect(() => {
    if (currentPR) {
      console.log('Current PR data:', currentPR);
      console.log('Additions:', currentPR.additions);
      console.log('Deletions:', currentPR.deletions);
      console.log('Files changed:', currentPR.filesChanged);
    }
  }, [currentPR]);

  const handleRepositoryAnalyzed = (repoData: any) => {
    console.log('Repository analyzed, received data:', repoData);
    console.log('Pull requests:', repoData.pullRequests);
    if (repoData.pullRequests && repoData.pullRequests.length > 0) {
      console.log('First PR data:', repoData.pullRequests[0]);
    }
    
    setCurrentRepository(repoData.repository);
    setCurrentPRs(repoData.pullRequests);
    setSelectedPR(0); // Select first PR
    
    // Add to analyzation history
    if (repoData.repository) {
      const newHistoryItem = {
        id: Date.now(),
        repository: repoData.repository,
        timestamp: new Date().toISOString(),
        prCount: repoData.pullRequests?.length || 0
      };
      
      setAnalyzationHistory(prev => [newHistoryItem, ...prev]);
      
      // Store in localStorage
      const history = JSON.parse(localStorage.getItem('analyzationHistory') || '[]');
      localStorage.setItem('analyzationHistory', JSON.stringify([newHistoryItem, ...history].slice(0, 10)));
    }
  };
  
  const handleAddDemoRepo = () => {
    // Create a demo repository entry
    const demoRepos = [
      {
        name: "react",
        owner: "facebook",
        url: "https://github.com/facebook/react",
        language: "JavaScript",
        stars: 212000,
        forks: 44500,
        openPRs: 3
      },
      {
        name: "vscode",
        owner: "microsoft",
        url: "https://github.com/microsoft/vscode",
        language: "TypeScript",
        stars: 152000,
        forks: 28300,
        openPRs: 5
      },
      {
        name: "tensorflow",
        owner: "tensorflow",
        url: "https://github.com/tensorflow/tensorflow",
        language: "C++",
        stars: 178000,
        forks: 89000,
        openPRs: 4
      }
    ];
    
    // Pick a random demo repo
    const randomRepo = demoRepos[Math.floor(Math.random() * demoRepos.length)];
    
    // Create a history item
    const demoHistoryItem = {
      id: Date.now(),
      repository: randomRepo,
      timestamp: new Date().toISOString(),
      prCount: randomRepo.openPRs
    };
    
    // Add to history
    setAnalyzationHistory(prev => [demoHistoryItem, ...prev]);
    
    // Store in localStorage
    const history = JSON.parse(localStorage.getItem('analyzationHistory') || '[]');
    localStorage.setItem('analyzationHistory', JSON.stringify([demoHistoryItem, ...history].slice(0, 10)));
    
    // Show toast notification
    toast({
      title: "Demo Repository Added",
      description: `Added ${randomRepo.name} by ${randomRepo.owner} to your history.`,
      variant: "default",
    });
  };

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('analyzationHistory');
    if (savedHistory) {
      setAnalyzationHistory(JSON.parse(savedHistory));
    }
  }, []);

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
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-4">
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
                {mockPRs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <GitPullRequest className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No pull requests to analyze</p>
                    <p className="text-xs">Analyze a GitHub repository to view its pull requests</p>
                  </div>
                ) : (
                  mockPRs.map((pr, index) => (
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
                  ))
                )}
              </CardContent>
            </Card>
            
            {/* Analyzation History */}
            <AnalyzationHistory 
              history={analyzationHistory}
              onSelectRepository={(historyItem) => {
                // Handle selecting a repository from history
                // This would typically re-fetch the data or use cached data
                if (historyItem.repository) {
                  setCurrentRepository(historyItem.repository);
                }
              }}
              onClearHistory={() => {
                setAnalyzationHistory([]);
                localStorage.removeItem('analyzationHistory');
              }}
              onAddDemoRepo={handleAddDemoRepo}
            />
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="space-y-6">
              {currentPR ? (
                <>
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
                      <div className="text-lg font-semibold text-green-600">+{currentPR.additions || 0}</div>
                      <p className="text-sm text-gray-500">Additions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">-{currentPR.deletions || 0}</div>
                      <p className="text-sm text-gray-500">Deletions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{currentPR.filesChanged || 0}</div>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original AI Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          Pull Request Analysis
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

                    {/* RAG Chatbot */}
                    <RAGChatbot repositoryUrl={currentRepository?.url} />
                  </div>
                </TabsContent>

                <TabsContent value="recommendations">
                  <RecommendationPanel pr={currentPR} repositoryUrl={currentRepository?.url || ''} />
                </TabsContent>
              </Tabs>
                </>
              ) : (
                <Card className="h-96">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Repository Selected</h3>
                      <p className="text-sm">Analyze a GitHub repository to view pull request analysis, security insights, and AI-powered recommendations.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
