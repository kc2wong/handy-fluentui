import { createContext } from 'react';

/** Global spinner configuration passed to HandyFluentUiProvider via spinnerConfig. */
type SpinnerContextConfig = {
  /** Milliseconds before the overlay becomes visible. Prevents flicker on fast operations. Defaults to 300. */
  initialDelay?: number;
  /** Default label supplier when show() is called without an explicit label. */
  label: {
    loading?: () => string;
  }
};

/** Imperative handle to the global overlay spinner, returned by useSpinner. */
type SpinnerContextType = {
  /** Shows the overlay spinner, optionally overriding defaultLabel. */
  show: (label?: string) => void;
  hide: () => void;
};

const SpinnerContext = createContext<SpinnerContextType>({
  show: () => {},
  hide: () => {},
});

export { SpinnerContext as FuiSpinnerContext };
export type { SpinnerContextConfig };