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
import { ArchitectureVisualization } from '@/components/ArchitectureVisualization';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">DevQ</h1>
                <p className="text-sm text-gray-400">Intelligent Pull Request Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105">
                Connect GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* GitHub Repository Input */}
        {!currentRepository && (
          <div className="mb-8">
            <GitHubRepoInput onRepositoryAnalyzed={handleRepositoryAnalyzed} />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {currentRepository && (
              <RepositoryInfo repository={currentRepository} />
            )}
            
            <Card className="h-fit bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-white">
                  <GitPullRequest className="w-5 h-5 mr-2 text-cyan-400" />
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
                    className="text-xs bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                  >
                    Analyze Different Repo
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPRs.length === 0 ? (
                  <div className="text-center py-8">
                    <GitPullRequest className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-300">No pull requests to analyze</p>
                    <p className="text-xs text-gray-500">Analyze a GitHub repository to view its pull requests</p>
                  </div>
                ) : (
                  mockPRs.map((pr, index) => (
                  <div
                    key={pr.id}
                    onClick={() => setSelectedPR(index)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedPR === index 
                        ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 shadow-lg shadow-cyan-500/20' 
                        : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant={pr.status === 'safe' ? 'default' : pr.status === 'risky' ? 'secondary' : 'destructive'}
                        className={
                          pr.status === 'safe' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' 
                            : pr.status === 'risky' 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        }
                      >
                        {pr.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-400 font-mono">#{pr.id}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 text-white">{pr.title}</h4>
                    <p className="text-xs text-gray-400 mb-3">by {pr.author}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{pr.filesChanged} files</span>
                      <span className="flex items-center text-gray-300">
                        Risk: <span className={`ml-1 font-semibold ${
                          pr.riskScore > 70 ? 'text-red-400' : 
                          pr.riskScore > 40 ? 'text-yellow-400' : 'text-emerald-400'
                        }`}>{pr.riskScore}%</span>
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
                  <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-white">{currentPR.title}</h2>
                        <Badge
                          variant={currentPR.status === 'safe' ? 'default' : currentPR.status === 'risky' ? 'secondary' : 'destructive'}
                          className={`${
                            currentPR.status === 'safe' 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                              : currentPR.status === 'risky' 
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          } text-sm px-3 py-1 shadow-lg`}
                        >
                          {currentPR.status === 'safe' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {currentPR.status === 'risky' && <AlertTriangle className="w-4 h-4 mr-1" />}
                          {currentPR.status === 'blocked' && <X className="w-4 h-4 mr-1" />}
                          {currentPR.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-400">PR #{currentPR.id} by <span className="text-gray-300 font-medium">{currentPR.author}</span></p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold mb-1 ${
                        currentPR.riskScore > 70 ? 'text-red-400' : 
                        currentPR.riskScore > 40 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {currentPR.riskScore}%
                      </div>
                      <p className="text-sm text-gray-400">Risk Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xl font-bold text-emerald-400">+{currentPR.additions || 0}</div>
                      <p className="text-sm text-gray-400">Additions</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="text-xl font-bold text-red-400">-{currentPR.deletions || 0}</div>
                      <p className="text-sm text-gray-400">Deletions</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xl font-bold text-blue-400">{currentPR.filesChanged || 0}</div>
                      <p className="text-sm text-gray-400">Files Changed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Risk Assessment</span>
                      <span className={`font-semibold ${
                        currentPR.riskScore > 70 ? 'text-red-400' : 
                        currentPR.riskScore > 40 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>{currentPR.riskScore}%</span>
                    </div>
                    <Progress 
                      value={currentPR.riskScore} 
                      className="h-3 bg-gray-800/50 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-600 shadow-inner" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-1 rounded-xl shadow-2xl shadow-black/20">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analysis" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
                  >
                    AI Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recommendations" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
                  >
                    Actions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="architecture" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
                  >
                    Architecture
                  </TabsTrigger>
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

                <TabsContent value="architecture">
                  <ArchitectureVisualization repository={currentRepository} pullRequest={currentPR} />
                </TabsContent>
              </Tabs>
                </>
              ) : (
                <Card className="h-96 bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                          <Shield className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-full animate-ping"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Repository Selected</h3>
                      <p className="text-sm text-gray-400 max-w-md">Analyze a GitHub repository to view pull request analysis, security insights, and AI-powered recommendations.</p>
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
