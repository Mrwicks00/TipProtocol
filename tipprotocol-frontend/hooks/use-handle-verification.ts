// hooks/use-handle-verification.ts
import { useState, useCallback } from 'react';

interface VerificationResult {
  available: boolean;
  verified: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    name: string;
    verified: boolean;
  };
}

interface UseHandleVerificationReturn {
  verifyHandle: (handle: string) => Promise<VerificationResult>;
  isVerifying: boolean;
  lastResult: VerificationResult | null;
  error: string | null;
  clearError: () => void;
}

export function useHandleVerification(): UseHandleVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyHandle = useCallback(async (handle: string): Promise<VerificationResult> => {
    if (!handle || handle.trim() === '') {
      const result: VerificationResult = {
        available: false,
        verified: false,
        message: 'Handle is required'
      };
      setLastResult(result);
      return result;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-twitter-handle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: handle.replace('@', '') }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const result: VerificationResult = {
        available: data.available,
        verified: data.verified,
        message: data.message,
        user: data.user,
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      
      const result: VerificationResult = {
        available: false,
        verified: false,
        message: errorMessage
      };
      
      setLastResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    verifyHandle,
    isVerifying,
    lastResult,
    error,
    clearError,
  };
}

// Enhanced validation utilities
export const TwitterHandleValidation = {
  // Basic format validation
  validateFormat: (handle: string): { isValid: boolean; error: string } => {
    const cleanHandle = handle.replace('@', '').trim();
    
    if (!cleanHandle) {
      return { isValid: false, error: 'Twitter handle is required' };
    }
    
    if (cleanHandle.length < 1 || cleanHandle.length > 15) {
      return { isValid: false, error: 'Twitter handle must be 1-15 characters' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle)) {
      return { isValid: false, error: 'Twitter handle can only contain letters, numbers, and underscores' };
    }
    
    if (/^[0-9]+$/.test(cleanHandle)) {
      return { isValid: false, error: 'Twitter handle cannot be all numbers' };
    }

    // Check for common invalid patterns
    if (cleanHandle.toLowerCase().includes('twitter')) {
      return { isValid: false, error: 'Handle cannot contain "twitter"' };
    }

    // Check for reserved words
    const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp', 'support', 'help'];
    if (reservedWords.includes(cleanHandle.toLowerCase())) {
      return { isValid: false, error: 'This handle is reserved' };
    }
    
    return { isValid: true, error: '' };
  },

  // Check for suspicious patterns that might indicate fake handles
  checkSuspiciousPatterns: (handle: string): { isSuspicious: boolean; reason: string } => {
    const cleanHandle = handle.replace('@', '').trim().toLowerCase();
    
    // Check for too many numbers
    const numberCount = (cleanHandle.match(/[0-9]/g) || []).length;
    if (numberCount > cleanHandle.length * 0.6) {
      return { isSuspicious: true, reason: 'Handle contains too many numbers' };
    }

    // Check for random-looking sequences
    const hasRandomPattern = /[a-z]{1}[0-9]{3,}$|^[a-z]{1,2}[0-9]{6,}/.test(cleanHandle);
    if (hasRandomPattern) {
      return { isSuspicious: true, reason: 'Handle appears to be randomly generated' };
    }

    // Check for common bot patterns
    const botPatterns = ['bot', 'fake', 'spam', 'test123', 'user123'];
    if (botPatterns.some(pattern => cleanHandle.includes(pattern))) {
      return { isSuspicious: true, reason: 'Handle contains suspicious keywords' };
    }

    return { isSuspicious: false, reason: '' };
  },

  // Clean and normalize handle
  normalizeHandle: (handle: string): string => {
    return handle.replace('@', '').trim().toLowerCase();
  }
};