import { useContext } from 'react';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

/** Returns error/info/warn logging functions that delegate to logMessage in HandyFluentUiContext. */
const useLogger = () => {
  const ctx = useContext(HandyFluentUiContext);
  if (!ctx) {
    throw new Error('useLogger must be used within HandyFluentUiProvider');
  }

  const logMessage = ctx.logMessage;
  return {
    debug: (msg: string) => logMessage(msg, 'debug'),
    error: (msg: string) => logMessage(msg, 'error'),
    info: (msg: string) => logMessage(msg, 'info'),
    warn: (msg: string) => logMessage(msg, 'warn'),
  };
};

export { useLogger };
