import { makeStyles, Spinner } from '@fluentui/react-components';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FuiSpinnerContext, SpinnerContextConfig } from '@context/spinner-context';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

type SpinnerProviderProps = {
  config?: SpinnerContextConfig;
  children: ReactNode;
};

const SpinnerProvider = ({ children, config }: SpinnerProviderProps) => {
  const styles = useStyles();
  const { initialDelay, label } = config ?? {};

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Counter instead of boolean to correctly handle concurrent show/hide calls.
  const [count, setCount] = useState(0);
  const [loadingLabel, setLoadingLabel] = useState<string | undefined>();

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const show = useCallback(
    (text?: string) => {
      setLoadingLabel(text || label?.loading);
      // Only show spinner if loading > 300ms:
      timerRef.current = setTimeout(() => {
        setCount((c) => c + 1);
        timerRef.current = null; // sentinel: null means the timer has fired, not that it was cancelled
      }, initialDelay ?? 300);
    },
    [config],
  );

  const hide = useCallback(() => {
    if (timerRef.current !== null) {
      // cancel incrementing count if loading is done before initialDelay
      clearTimeout(timerRef.current);
      timerRef.current = null;
    } else {
      setCount((c) => Math.max(0, c - 1));
    }
    setLoadingLabel(undefined);
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <FuiSpinnerContext.Provider value={value}>
      {children}
      {count > 0 && (
        <div className={styles.overlay}>
          <Spinner label={loadingLabel} />
        </div>
      )}
    </FuiSpinnerContext.Provider>
  );
};

export { SpinnerProvider };
export type { SpinnerProviderProps };
