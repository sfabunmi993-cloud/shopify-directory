import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && !conversation) {
      createConversation();
    }
  }, [isOpen]);

  // Allow other components (e.g. SupportContactBar) to open the chat.
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-support-chat', handler);
    return () => window.removeEventListener('open-support-chat', handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversation = async () => {
    try {
      const newConversation = await base44.agents.createConversation({
        agent_name: 'support-assistant',
        metadata: {
          name: 'Support Chat',
          description: 'User support conversation'
        }
      });
      setConversation(newConversation);

      const unsubscribe = base44.agents.subscribeToConversation(
        newConversation.id,
        (data) => {
          setMessages(data.messages || []);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen &&
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hidden"
        size="icon">
        
          <MessageCircle className="w-6 h-6" />
        </Button>
      }

      {/* Chat Window */}
      {isOpen &&
      <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Support Assistant</p>
                <p className="text-xs text-primary-foreground/80">
                  Here to help you navigate the platform
                </p>
              </div>
            </div>
            <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary/80">
            
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 &&
            <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Hi! I'm your support assistant. Ask me anything about using
                    the platform!
                  </p>
                </div>
            }
              {messages.map((message, index) =>
            <div
              key={index}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}>
              
                  <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user' ?
                  'bg-primary text-primary-foreground' :
                  'bg-muted'
                )}>
                
                    {message.role === 'assistant' ?
                <ReactMarkdown
                  className="prose prose-sm"
                  components={{
                    p: ({ children }) =>
                    <p className="my-1">{children}</p>,

                    ul: ({ children }) =>
                    <ul className="list-disc list-inside my-1">
                              {children}
                            </ul>,

                    ol: ({ children }) =>
                    <ol className="list-decimal list-inside my-1">
                              {children}
                            </ol>

                  }}>
                  
                        {message.content}
                      </ReactMarkdown> :

                <p>{message.content}</p>
                }
                  </div>
                </div>
            )}
              {isLoading &&
            <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
            }
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1" />
            
              <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon">
              
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      }
    </>);

}