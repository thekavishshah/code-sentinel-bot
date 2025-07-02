import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, FileText, Database, Globe, Zap, Download, AlertCircle, GitPullRequest } from 'lucide-react';

interface ArchitectureVisualizationProps {
  repository?: any;
  pullRequest?: any;
}

export const ArchitectureVisualization: React.FC<ArchitectureVisualizationProps> = ({
  repository,
  pullRequest
}) => {
  const [activeView, setActiveView] = useState('overview');
  const [mermaidAvailable, setMermaidAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test if mermaid is available and working
    const testMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        await mermaid.default.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          themeVariables: {
            primaryColor: '#22d3ee',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#0891b2',
            lineColor: '#94a3b8',
            sectionBkgColor: '#1e293b',
            altSectionBkgColor: '#334155',
            gridColor: '#475569',
            secondaryColor: '#64748b',
            tertiaryColor: '#475569'
          }
        });
        setMermaidAvailable(true);
        console.log('Mermaid initialized successfully');
      } catch (error) {
        console.error('Mermaid initialization failed:', error);
        setMermaidAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    testMermaid();
  }, []);

  const renderMermaidDiagram = async (diagram: string, elementId: string) => {
    try {
      if (!mermaidAvailable) return;
      
      const mermaid = await import('mermaid');
      const element = document.getElementById(elementId);
      
      if (element) {
        element.innerHTML = '';
        const uniqueId = `diagram-${elementId}-${Date.now()}`;
        const { svg } = await mermaid.default.render(uniqueId, diagram);
        element.innerHTML = svg;
        console.log(`Successfully rendered ${elementId}`);
      }
    } catch (error) {
      console.error(`Error rendering ${elementId}:`, error);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="flex items-center justify-center h-64 text-red-500 bg-red-50 rounded-lg border border-red-200">
            <div class="text-center">
              <div class="text-lg font-semibold mb-2">Diagram Rendering Error</div>
              <div class="text-sm">Unable to generate ${elementId.replace('-diagram', '')} diagram</div>
            </div>
          </div>
        `;
      }
    }
  };

  const generateSimpleOverview = () => {
    const { frontend, backend, database } = detectTechStack();
    const repoName = repository?.name || 'Repository';
    const repoLanguage = repository?.language || 'Code';
    
    // Dynamic components based on tech stack
    let frontendComponents = ["UI Components", "Components"];
    let backendComponents = ["API Endpoints", "Services"];
    let databaseComponents = ["Data Store", "Storage"];
    
    if (frontend.includes('React')) {
      frontendComponents = ["React Components", "Hooks & Context"];
    } else if (frontend.includes('Vue')) {
      frontendComponents = ["Vue Components", "Vuex Store"];
    } else if (frontend.includes('Angular')) {
      frontendComponents = ["Angular Components", "Services"];
    } else if (frontend.includes('Python')) {
      frontendComponents = ["Templates", "Static Files"];
    }
    
    if (backend.includes('Express')) {
      backendComponents = ["Express Routes", "Middleware"];
    } else if (backend.includes('Django')) {
      backendComponents = ["Django Views", "Models"];
    } else if (backend.includes('Flask')) {
      backendComponents = ["Flask Routes", "Blueprints"];
    } else if (backend.includes('Spring')) {
      backendComponents = ["Spring Controllers", "Services"];
    } else if (backend.includes('Rails')) {
      backendComponents = ["Rails Controllers", "Models"];
    }
    
    if (database.includes('PostgreSQL')) {
      databaseComponents = ["PostgreSQL", "Relations"];
    } else if (database.includes('MongoDB')) {
      databaseComponents = ["MongoDB", "Collections"];
    } else if (database.includes('MySQL')) {
      databaseComponents = ["MySQL", "Tables"];
    }
    
    return `graph TB
    A["${repoName}"] --> B["${frontend}"]
    A --> C["${backend}"]
    A --> D["${database}"]
    A --> E["${repoLanguage} Code"]
    
    B --> B1["${frontendComponents[0]}"]
    B --> B2["${frontendComponents[1]}"]
    
    C --> C1["${backendComponents[0]}"]
    C --> C2["${backendComponents[1]}"]
    
    D --> D1["${databaseComponents[0]}"]
    D --> D2["${databaseComponents[1]}"]
    
    E --> E1["Source Code"]
    E --> E2["Configuration"]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec`;
  };

  // Detect tech stack based on repository data
  const detectTechStack = () => {
    const repoLanguage = repository?.language?.toLowerCase() || '';
    const repoName = repository?.name?.toLowerCase() || '';
    
    // Default stack
    let frontend = "Frontend";
    let backend = "Backend";
    let database = "Database";
    let language = "Application";
    
    // Language-based detection
    if (repoLanguage.includes('javascript') || repoLanguage.includes('typescript')) {
      frontend = repoName.includes('react') || repoName.includes('next') ? "React App" : 
                repoName.includes('vue') ? "Vue App" :
                repoName.includes('angular') ? "Angular App" : "JavaScript App";
      backend = repoName.includes('express') ? "Express API" :
               repoName.includes('fastify') ? "Fastify API" :
               repoName.includes('koa') ? "Koa API" : "Node.js API";
    } else if (repoLanguage.includes('python')) {
      language = "Python App";
      backend = repoName.includes('django') ? "Django API" :
               repoName.includes('flask') ? "Flask API" :
               repoName.includes('fastapi') ? "FastAPI" : "Python API";
      database = repoName.includes('postgres') ? "PostgreSQL" :
                repoName.includes('mongo') ? "MongoDB" :
                repoName.includes('redis') ? "Redis" : "Database";
    } else if (repoLanguage.includes('java')) {
      language = "Java App";
      backend = repoName.includes('spring') ? "Spring Boot" :
               repoName.includes('vertx') ? "Vert.x API" : "Java API";
      database = "Database";
    } else if (repoLanguage.includes('go')) {
      language = "Go App";
      backend = repoName.includes('gin') ? "Gin API" :
               repoName.includes('echo') ? "Echo API" :
               repoName.includes('fiber') ? "Fiber API" : "Go API";
    } else if (repoLanguage.includes('rust')) {
      language = "Rust App";
      backend = repoName.includes('actix') ? "Actix Web" :
               repoName.includes('warp') ? "Warp API" : "Rust API";
    } else if (repoLanguage.includes('php')) {
      language = "PHP App";
      backend = repoName.includes('laravel') ? "Laravel API" :
               repoName.includes('symfony') ? "Symfony API" : "PHP API";
    } else if (repoLanguage.includes('ruby')) {
      language = "Ruby App";
      backend = repoName.includes('rails') ? "Ruby on Rails" : "Ruby API";
    } else if (repoLanguage.includes('c#') || repoLanguage.includes('csharp')) {
      language = "C# App";
      backend = ".NET API";
    }
    
    // Database detection from repository name
    if (repoName.includes('postgres') || repoName.includes('postgresql')) {
      database = "PostgreSQL";
    } else if (repoName.includes('mongo') || repoName.includes('mongodb')) {
      database = "MongoDB";
    } else if (repoName.includes('mysql')) {
      database = "MySQL";
    } else if (repoName.includes('redis')) {
      database = "Redis";
    } else if (repoName.includes('sqlite')) {
      database = "SQLite";
    } else if (repoName.includes('supabase')) {
      database = "Supabase";
    } else if (repoName.includes('firebase')) {
      database = "Firebase";
    }
    
    return { frontend, backend, database, language };
  };

  const generateSimpleTechnical = () => {
    const { frontend, backend, database, language } = detectTechStack();
    const repoLanguage = repository?.language || 'Unknown';
    
    return `graph LR
    A["${frontend}"] --> B["${backend}"]
    B --> C["${database}"]
    B --> D["GitHub API"]
    B --> E["External APIs"]
    
    F["${repoLanguage}"] --> A
    
    style A fill:#61dafb
    style B fill:#68d391
    style C fill:#3182ce
    style D fill:#24292e
    style E fill:#ff6b35
    style F fill:#ffd700`;
  };

  const generateSimpleDataFlow = () => {
    const { frontend, backend } = detectTechStack();
    const repoName = repository?.name || 'Repository';
    const repoType = repository?.language || 'Code';
    
    // Create more specific data flow based on repository type
    let dataFlowSteps = [
      "Enter Repo URL",
      "Request Analysis", 
      "Fetch Repo Data",
      "Return PRs",
      "Analyze Code",
      "Return Insights",
      "Complete Analysis",
      "Show Results"
    ];
    
    if (repoType.toLowerCase().includes('python')) {
      dataFlowSteps[4] = "Analyze Python Code";
      dataFlowSteps[5] = "Return Security & Quality Insights";
    } else if (repoType.toLowerCase().includes('java')) {
      dataFlowSteps[4] = "Analyze Java Code";
      dataFlowSteps[5] = "Return Enterprise Security Report";
    } else if (repoType.toLowerCase().includes('javascript') || repoType.toLowerCase().includes('typescript')) {
      dataFlowSteps[4] = "Analyze JS/TS Code";
      dataFlowSteps[5] = "Return Frontend/Backend Insights";
    } else if (repoType.toLowerCase().includes('go')) {
      dataFlowSteps[4] = "Analyze Go Code";
      dataFlowSteps[5] = "Return Performance & Security Report";
    } else if (repoType.toLowerCase().includes('rust')) {
      dataFlowSteps[4] = "Analyze Rust Code";
      dataFlowSteps[5] = "Return Memory Safety Analysis";
    }
    
    return `sequenceDiagram
    participant U as User
    participant F as ${frontend}
    participant B as ${backend}
    participant G as GitHub (${repoName})
    participant C as AI Analyzer
    
    U->>F: ${dataFlowSteps[0]}
    F->>B: ${dataFlowSteps[1]}
    B->>G: ${dataFlowSteps[2]}
    G-->>B: ${dataFlowSteps[3]}
    B->>C: ${dataFlowSteps[4]}
    C-->>B: ${dataFlowSteps[5]}
    B-->>F: ${dataFlowSteps[6]}
    F-->>U: ${dataFlowSteps[7]}`;
  };

  useEffect(() => {
    if (mermaidAvailable && !isLoading) {
      const timer = setTimeout(() => {
        if (activeView === 'overview') {
          renderMermaidDiagram(generateSimpleOverview(), 'overview-diagram');
        } else if (activeView === 'technical') {
          renderMermaidDiagram(generateSimpleTechnical(), 'technical-diagram');
        } else if (activeView === 'dataflow') {
          renderMermaidDiagram(generateSimpleDataFlow(), 'dataflow-diagram');
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [activeView, mermaidAvailable, isLoading, repository]);

  const StaticFallback = ({ type }: { type: string }) => {
    const { frontend, backend, database } = detectTechStack();
    const repoName = repository?.name || 'Repository';
    const repoLanguage = repository?.language || 'Unknown';
    
    const getDescription = () => {
      if (type === 'overview') {
        return `Shows the main components of ${repoName}: ${frontend}, ${backend}, ${database}, and source code structure`;
      } else if (type === 'technical') {
        return `Technology stack: ${repoLanguage} → ${frontend} → ${backend} → ${database}, with external integrations`;
      } else if (type === 'dataflow') {
        return `User submits ${repoName} → ${frontend} requests analysis → ${backend} fetches GitHub data → AI analyzes ${repoLanguage} code → Results displayed`;
      }
      return '';
    };
    
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center border border-gray-600/30 rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
              <AlertCircle className="w-8 h-8 text-purple-400" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-3">
            {type === 'overview' && `${repoName} Architecture`}
            {type === 'technical' && `${repoLanguage} Tech Stack`}
            {type === 'dataflow' && `${repoName} Data Flow`}
          </h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {getDescription()}
          </p>
          <div className="flex justify-center space-x-3 text-xs">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {repoLanguage}
            </Badge>
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Interactive diagram loading...
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Network className="w-5 h-5 mr-2 text-cyan-400" />
              Repository Architecture
            </CardTitle>
            <CardDescription className="text-gray-400">Loading architecture visualization...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 border-t-2 border-t-transparent"></div>
                <span className="text-gray-300 text-lg">Initializing diagram renderer...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center text-white">
                <Network className="w-6 h-6 mr-3 text-cyan-400" />
                Repository Architecture
              </CardTitle>
              <CardDescription className="text-gray-400">
                Visual representation of <span className="text-cyan-400 font-medium">{repository?.name || 'the repository'}</span> structure and data flow
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={`text-xs border transition-all duration-300 ${
                mermaidAvailable 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-lg shadow-orange-500/10'
              }`}>
                <Zap className="w-3 h-3 mr-1" />
                {mermaidAvailable ? 'Interactive' : 'Static View'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/60 backdrop-blur-xl border border-gray-600/50 p-1 rounded-xl shadow-xl shadow-black/20">
              <TabsTrigger 
                value="overview" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
              >
                <Globe className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="technical" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Technical Stack
              </TabsTrigger>
              <TabsTrigger 
                value="dataflow" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 text-gray-400 hover:text-gray-200 transition-all duration-300 rounded-lg"
              >
                <Database className="w-4 h-4 mr-2" />
                Data Flow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  High-level architecture overview showing main components and their relationships
                </div>
                <div 
                  id="overview-diagram" 
                  className="w-full min-h-[400px] flex items-center justify-center border border-gray-700/50 rounded-xl bg-gray-800/20 backdrop-blur-sm shadow-inner shadow-black/20"
                >
                  {!mermaidAvailable && <StaticFallback type="overview" />}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  Technical stack visualization showing technologies and their integration points
                </div>
                <div 
                  id="technical-diagram" 
                  className="w-full min-h-[400px] flex items-center justify-center border border-gray-700/50 rounded-xl bg-gray-800/20 backdrop-blur-sm shadow-inner shadow-black/20"
                >
                  {!mermaidAvailable && <StaticFallback type="technical" />}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dataflow" className="mt-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  Sequence diagram showing how data flows through the system during analysis
                </div>
                <div 
                  id="dataflow-diagram" 
                  className="w-full min-h-[400px] flex items-center justify-center border border-gray-700/50 rounded-xl bg-gray-800/20 backdrop-blur-sm shadow-inner shadow-black/20"
                >
                  {!mermaidAvailable && <StaticFallback type="dataflow" />}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Architecture Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/20 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-400" />
              Primary Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {repository?.language || 'Unknown'}
            </div>
            <p className="text-xs text-gray-400 mt-1">Main Technology</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl border-emerald-500/20 shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-emerald-400" />
              Repository Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {repository?.stars ? `${repository.stars}⭐` : 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1">GitHub Stars</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-purple-500/20 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <GitPullRequest className="w-4 h-4 mr-2 text-purple-400" />
              Active PRs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {repository?.openPRs || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">Pull Requests</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};