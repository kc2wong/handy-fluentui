import {
  Theme,
} from '@fluentui/react-components';
import { createContext } from 'react';

import { SpinnerContextConfig } from './spinner-context';
import { ToastContextConfig } from './toast-context';

// ─── Language ────────────────────────────────────────────────────────────────

/** Provider-level configuration for spinner and toast. */
type Component = {
  spinner?: SpinnerContextConfig;
  toast?: ToastContextConfig;
};

// ─── Theme ───────────────────────────────────────────────────────────────────

/** Active theme key. 'custom' is only selectable when a custom Theme object is supplied in SupportedTheme. */
type ThemeType = 'light' | 'dark' | 'custom';

/** Per-slot theme objects for one platform. Omit a key to fall back to the built-in FluentUI theme. */
type ThemeMapping = {
  light?: Theme;
  dark?: Theme;
  custom?: Theme;
};

/** Separate theme sets for web and mobile viewports, plus an optional startup default. */
type SupportedTheme = {
  web?: ThemeMapping;
  mobile?: ThemeMapping;
  default?: ThemeType;
};

// ─── Logging ─────────────────────────────────────────────────────────────────

/** Severity levels for logMessage and useLogger. */
type LoggingLevel = 'info' | 'warn' | 'error' | 'debug';

// ─── Config & Context ────────────────────────────────────────────────────────

/** Configuration prop of HandyFluentUiProvider. All fields are optional; sensible defaults are provided. */
type HandyFluentUiConfig = {
  /** Viewport width (px) at which the mobile layout activates. Defaults to 600. */
  mobileBreakpoint?: number;
  supportedTheme?: SupportedTheme;
  component?: Component;
  loggerConfig?: {
    /** Custom logger. Defaults to console.log with a [LEVEL] prefix when omitted. */
    logMessage?: (message: string, level: LoggingLevel) => void;
  };
};

/** Context shape consumed by useTheme, useLogger, and useIsMobile. */
type HandyFluentUiContextType = {
  selectedTheme: ThemeType;
  supportedThemeType: ThemeType[];
  switchTheme: (themeType: ThemeType) => void;
  mobileBreakpoint: number;
  // IANA timezone or UTC offset
  timeZone: string;
  logMessage: (message: string, level?: LoggingLevel) => void;
};

const HandyFluentUiContext = createContext<HandyFluentUiContextType | undefined>(undefined);

export { HandyFluentUiContext };
export type {
  Component,
  ThemeType,
  SupportedTheme,
  LoggingLevel,
  HandyFluentUiConfig,
  HandyFluentUiContextType,
};
