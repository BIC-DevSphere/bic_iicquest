import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import socketService from '@/services/socketService';
import { getCurrentUserId } from '@/utils/auth';

const WebSocketDebugger = ({ sessionId, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [testMessage, setTestMessage] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    // Check initial connection
    setIsConnected(socketService.isSocketConnected());
    addLog(`Initial connection status: ${socketService.isSocketConnected()}`);

    // Connect if not connected
    if (!socketService.isSocketConnected()) {
      const token = localStorage.getItem('token');
      if (token) {
        addLog('Attempting to connect to WebSocket...');
        socketService.connect(token)
          .then(() => {
            addLog('Successfully connected to WebSocket', 'success');
            setIsConnected(true);
            if (sessionId) {
              addLog(`Joining session: ${sessionId}`);
              socketService.joinSession(sessionId);
            }
          })
          .catch(error => {
            addLog(`Failed to connect: ${error.message}`, 'error');
          });
      }
    } else if (sessionId) {
      addLog(`Joining session: ${sessionId}`);
      socketService.joinSession(sessionId);
    }

    // Set up message listeners
    socketService.onNewMessage((messageData) => {
      addLog(`📨 Received message: ${messageData.text}`, 'success');
      setMessages(prev => [...prev, {
        ...messageData,
        received: true,
        timestamp: new Date().toISOString()
      }]);
    });

    socketService.onMessageSent((data) => {
      addLog(`✅ Message sent confirmation: ${data.messageId}`, 'success');
    });

    socketService.onMessageError((data) => {
      addLog(`❌ Message error: ${data.error}`, 'error');
    });

    return () => {
      addLog('Cleaning up debug listeners');
    };
  }, [sessionId]);

  const sendTestMessage = () => {
    if (!testMessage.trim() || !sessionId) return;

    addLog(`📤 Sending test message: ${testMessage}`);
    
    if (socketService.isSocketConnected()) {
      socketService.sendMessage(sessionId, testMessage, 'message');
      
      // Add to local messages for comparison
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: testMessage,
        sender: { _id: getCurrentUserId(), fullName: 'Me (Debug)' },
        type: 'message',
        timestamp: new Date().toISOString(),
        sent: true
      }]);
      
      setTestMessage('');
    } else {
      addLog('Cannot send message - WebSocket not connected', 'error');
    }
  };

  const reconnect = async () => {
    addLog('Attempting to reconnect...');
    try {
      const token = localStorage.getItem('token');
      await socketService.connect(token);
      setIsConnected(true);
      if (sessionId) {
        socketService.joinSession(sessionId);
      }
      addLog('Reconnected successfully', 'success');
    } catch (error) {
      addLog(`Reconnection failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card className="bg-white shadow-lg border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">WebSocket Debugger</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Connection Controls */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={reconnect}
              disabled={isConnected}
            >
              Reconnect
            </Button>
            <Badge variant="outline">Session: {sessionId || 'None'}</Badge>
          </div>

          {/* Test Message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message..."
              className="flex-1 px-2 py-1 border rounded text-sm"
              onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
            />
            <Button size="sm" onClick={sendTestMessage} disabled={!isConnected || !sessionId}>
              Send
            </Button>
          </div>

          {/* Messages */}
          <div className="bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
            <div className="text-xs font-medium mb-1">Messages ({messages.length}):</div>
            {messages.slice(-3).map((msg, i) => (
              <div key={i} className="text-xs mb-1">
                <span className={msg.sent ? 'text-blue-600' : 'text-green-600'}>
                  {msg.sent ? '→' : '←'} {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Debug Logs */}
          <div className="bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
            <div className="text-xs font-medium mb-1">Debug Logs:</div>
            {debugLogs.slice(-5).map((log, i) => (
              <div key={i} className={`text-xs ${
                log.type === 'error' ? 'text-red-600' : 
                log.type === 'success' ? 'text-green-600' : 'text-gray-600'
              }`}>
                [{log.timestamp}] {log.message}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebSocketDebugger; 