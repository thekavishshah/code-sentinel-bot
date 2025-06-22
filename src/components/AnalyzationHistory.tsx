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
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <History className="w-5 h-5 mr-2" />
            Analysis History
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-8 w-8 p-0"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {history.length > 0 ? (
              <div className="space-y-2 p-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectRepository(item)}
                    className="p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm group-hover:text-blue-700 transition-colors">{item.repository.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.prCount} PRs</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">by {item.repository.owner}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-4">
                <div className="text-center text-gray-500 mb-4">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No analysis history yet</p>
                  <p className="text-xs mt-1">Analyzed repositories will appear here</p>
                </div>
                
                {onAddDemoRepo && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onAddDemoRepo}
                    className="flex items-center text-xs"
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