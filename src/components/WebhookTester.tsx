
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';

export const WebhookTester = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testMessage, setTestMessage] = useState('Hello, this is a test message!');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          timestamp: new Date().toISOString(),
          session_id: 'test_session'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: "Success",
        description: "Webhook test completed successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to test webhook: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
        <CardDescription>
          Test your webhook endpoint to ensure it's working correctly with the chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-api.com/webhook"
          />
        </div>

        <div>
          <Label htmlFor="test-message">Test Message</Label>
          <Input
            id="test-message"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
          />
        </div>

        <Button onClick={testWebhook} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Test Webhook
            </>
          )}
        </Button>

        {response && (
          <div>
            <Label>Response</Label>
            <Textarea
              value={response}
              readOnly
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
