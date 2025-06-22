import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Send, Github, Loader2, MessageSquare, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ragService, ChatMessage, RepositoryData } from '@/services/ragService';
import ReactMarkdown from 'react-markdown';

interface RAGChatbotProps {
  className?: string;
}

export const RAGChatbot = ({ className }: RAGChatbotProps) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [repositoryData, setRepositoryData] = useState<RepositoryData | null>(null);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const validateGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url.trim());
  };

  const handleIngestRepository = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    if (!validateGitHubUrl(repoUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    setIsIngesting(true);
    setError('');

    try {
      // First test repository access
      toast({
        title: "Testing Repository Access",
        description: "Checking if repository is accessible...",
      });

      const accessTest = await ragService.testRepositoryAccess(repoUrl.trim());
      
      if (!accessTest.accessible) {
        throw new Error(`Repository not accessible: ${accessTest.error}`);
      }

      console.log('Repository info:', accessTest.info);

      // Skip API test for now - we'll handle it when first message is sent
      console.log('⏭️ Skipping Claude API test during ingestion (will test on first chat message)');

      toast({
        title: "Ingesting Repository",
        description: "Analyzing repository contents and creating embeddings...",
      });

      const repoData = await ragService.ingestRepository(repoUrl.trim());
      setRepositoryData(repoData);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `🎉 Successfully ingested **${repoData.owner}/${repoData.repo}**!\n\nI've analyzed ${repoData.chunks.length} code chunks from the repository. You can now ask me questions about:\n\n- Code structure and architecture\n- Specific functions or classes\n- How different parts work together\n- Documentation and README content\n- Implementation details\n\nWhat would you like to know about this repository?`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);

      toast({
        title: "Repository Ready",
        description: `Ingested ${repoData.chunks.length} code chunks. You can now ask questions!`,
      });

    } catch (err) {
      console.error('Ingestion error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to ingest repository';
      setError(errorMessage);
      
      toast({
        title: "Ingestion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !repositoryData || isLoading) return;

    console.log(`💬 User sending message: "${currentMessage.trim()}"`);

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);

    try {
      console.log(`🚀 Calling ragService.generateResponse...`);
      console.log(`📊 Repository: ${repoUrl}`);
      console.log(`💭 Message history length: ${messages.length}`);
      
      const response = await ragService.generateResponse(
        repoUrl,
        messageToSend,
        messages
      );

      console.log(`✅ Received response from RAG service: ${response.length} characters`);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('❌ Chat error in component:', err);
      
      if (err instanceof Error) {
        console.error(`❌ Chat error name: ${err.name}`);
        console.error(`❌ Chat error message: ${err.message}`);
        console.error(`❌ Chat error stack: ${err.stack}`);
      }
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log(`🏁 Message processing complete, setting loading to false`);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (repositoryData) {
        handleSendMessage();
      } else {
        handleIngestRepository();
      }
    }
  };

  const resetChat = () => {
    setMessages([]);
    setRepositoryData(null);
    setRepoUrl('');
    setError('');
  };

  return (
    <div className={className}>
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Repository AI Assistant
            </div>
            {repositoryData && (
              <Button size="sm" variant="outline" onClick={resetChat}>
                New Repository
              </Button>
            )}
          </CardTitle>
          
          {repositoryData ? (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 border-green-200">
                <Github className="w-3 h-3 mr-1" />
                {repositoryData.owner}/{repositoryData.repo}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {repositoryData.chunks.length} chunks
              </Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="https://github.com/octocat/Hello-World"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleKeyPress(e as any);
                    }
                  }}
                  className="flex-1"
                  disabled={isIngesting}
                />
                <Button 
                  onClick={handleIngestRepository}
                  disabled={isIngesting || !repoUrl.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isIngesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Repository
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
                <p className="mb-2">Enter a GitHub repository URL to start an intelligent conversation about the codebase.</p>
                <div className="text-xs space-y-1">
                  <p><strong>Recommended for testing:</strong></p>
                  <p>• https://github.com/octocat/Hello-World (simple)</p>
                  <p>• https://github.com/vercel/next.js (larger project)</p>
                  <p>• https://github.com/facebook/create-react-app</p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {repositoryData && (
          <>
            <Separator />
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <ReactMarkdown 
                            className="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100"
                            components={{
                              code: ({ node, inline, className, children, ...props }: any) => (
                                inline ? (
                                  <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block bg-gray-800 text-gray-100 p-3 rounded" {...props}>
                                    {children}
                                  </code>
                                )
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about this repository..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleKeyPress(e as any);
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <p>💡 Try asking: "How does authentication work?", "Explain the main components", or "Show me the API endpoints"</p>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};