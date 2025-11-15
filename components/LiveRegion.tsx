'use client';

import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearDelay?: number;
}

/**
 * Live region component for announcing dynamic content changes to screen readers
 * @param message - The message to announce
 * @param politeness - How urgently to announce ('polite' or 'assertive')
 * @param clearDelay - Milliseconds before clearing the message (default: 3000)
 */
export default function LiveRegion({
  message,
  politeness = 'polite',
  clearDelay = 3000
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (message && clearDelay > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearDelay);

      return () => clearTimeout(timer);
    }
  }, [message, clearDelay]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}
