import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const WebRTCContext = createContext();

export const useWebRTC = () => useContext(WebRTCContext);

export const WebRTCProvider = ({ children }) => {
  const [myId, setMyId] = useState('');
  const wsRef = useRef(null);
  const messageHandlersRef = useRef(new Set());

  // Use a stable function for sendMessage
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message not sent:', message);
    }
  }, []);

  // Register and unregister message handlers
  const registerMessageHandler = useCallback((handler) => {
    messageHandlersRef.current.add(handler);
    return () => messageHandlersRef.current.delete(handler);
  }, []);

  useEffect(() => {
    // Generate a unique ID for this client on mount
    const generatedId = `user-${Math.random().toString(36).substring(2, 11)}`;
    setMyId(generatedId);

    // Utilise l'URL fournie par l'environnement de déploiement, sinon localhost.
    // Note : window.location.protocol === 'https:' est vrai pour les sites déployés en HTTPS.
    const defaultProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocketUrl = process.env.REACT_APP_WEBSOCKET_URL || `${defaultProtocol}//localhost:8080`;
    const ws = new WebSocket(websocketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to signaling server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Notify all registered handlers
      messageHandlersRef.current.forEach(handler => handler(message));
    };

    ws.onclose = () => {
      console.log('Disconnected from signaling server');
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  const value = {
    myId,
    sendMessage,
    registerMessageHandler,
  };

  return <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>;
};