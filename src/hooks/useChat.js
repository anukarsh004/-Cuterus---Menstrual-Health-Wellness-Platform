/**
 * useChat - Custom hook for chat state management
 * 
 * Integrates with the chatService to provide:
 * - Message history management
 * - Typing indicator state
 * - Error handling with meaningful UI messages
 * - Chat log monitoring access
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage, ChatError, ErrorTypes, ErrorMessages, getChatLogs } from '../services/chatService.js';
import { useApp } from '../context/AppContext';

export function useChat() {
  const { user, chatMessages, addChatMessage } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [monitoring, setMonitoring] = useState({
    lastResponseTime: null,
    lastProvider: null,
    lastErrorType: null,
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const isMounted = useRef(true);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Send a chat message
   */
  const sendMessage = useCallback(async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Clear any previous error
    setError(null);

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);

    // Clear input
    setInput('');

    // Show typing indicator
    setIsTyping(true);

    // Build message history
    const allMessages = [...chatMessages, userMessage];

    try {
      // Send to backend AI with retry, dedup, and caching
      const result = await sendChatMessage(allMessages, null, user, {
        debounce: true,
        useCache: true,
      });

      if (!isMounted.current) return;

      // Add AI response to chat
      addChatMessage({
        role: 'assistant',
        content: result.message,
        timestamp: new Date().toISOString(),
      });

      // Update monitoring data
      setMonitoring({
        lastResponseTime: result.usage?.totalTokens 
          ? `~${Math.round(result.usage.totalTokens / 10)}ms` 
          : 'N/A',
        lastProvider: result.provider || 'unknown',
        lastErrorType: null,
      });

    } catch (err) {
      if (!isMounted.current) return;

      let errorMessage;
      let errorType;

      if (err instanceof ChatError) {
        errorType = err.errorType;
        errorMessage = err.message;
      } else {
        errorType = ErrorTypes.INTERNAL_SERVER_ERROR;
        errorMessage = ErrorMessages[ErrorTypes.INTERNAL_SERVER_ERROR];
      }

      // Set error state for UI display
      setError({
        type: errorType,
        message: errorMessage,
      });

      // Update monitoring
      setMonitoring(prev => ({
        ...prev,
        lastErrorType: errorType,
      }));

      // Add error message to chat so user can see it
      addChatMessage({
        role: 'assistant',
        content: `⚠️ ${errorMessage}\n\nPlease try again in a moment. If the issue persists, check your connection or contact support.`,
        timestamp: new Date().toISOString(),
        isError: true,
      });

    } finally {
      if (isMounted.current) {
        setIsTyping(false);
      }
    }
  }, [input, chatMessages, user, addChatMessage]);

  /**
   * Handle send button click
   */
  const handleSend = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

  /**
   * Handle key down (Enter to send)
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  /**
   * Handle quick action click
   */
  const handleQuickAction = useCallback(async (actionMessage) => {
    await sendMessage(actionMessage);
  }, [sendMessage]);

  return {
    // State
    input,
    setInput,
    isTyping,
    error,
    clearError,
    monitoring,
    
    // Chat logs
    getChatLogs,
    
    // Refs
    chatEndRef,
    inputRef,
    
    // Actions
    handleSend,
    handleKeyDown,
    handleQuickAction,
  };
}
