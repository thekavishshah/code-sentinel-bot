import React from 'react';
import { History, Trash2, ExternalLink, Calendar, Info, ArrowRight, Github } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface AnalyzationHistoryProps {
  history: Array<{
    id: number;
    repository: {
      name: string;
      owner: string;
      url: string;
    };
    timestamp: string;
    prCount: number;
  }>;
  onSelectRepository: (historyItem: any) => void;
  onClearHistory: () => void;
  onAddDemoRepo?: () => void;
}

export const AnalyzationHistory = ({
  history,
  onSelectRepository,
  onClearHistory,
  onAddDemoRepo
}: AnalyzationHistoryProps) => {
  return (
    <Card className="h-fit bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg text-white">
            <History className="w-5 h-5 mr-2 text-cyan-400" />
            Analysis History
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-8 w-8 p-0 hover:bg-gray-800/50"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400 transition-colors" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {history.length > 0 ? (
              <div className="space-y-3 p-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectRepository(item)}
                    className="p-4 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-cyan-500/50 hover:bg-gray-700/40 cursor-pointer transition-all duration-300 group relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-white group-hover:text-cyan-400 transition-colors">{item.repository.name}</h4>
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full border border-gray-600/50">{item.prCount} PRs</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">by {item.repository.owner}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-4">
                <div className="text-center mb-4">
                  <Info className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-50" />
                  <p className="text-sm text-gray-300">No analysis history yet</p>
                  <p className="text-xs mt-1 text-gray-400">Analyzed repositories will appear here</p>
                </div>
                
                {onAddDemoRepo && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onAddDemoRepo}
                    className="flex items-center text-xs bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <Github className="w-3 h-3 mr-1" />
                    Try Demo Repository
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}; 