import {
  FluentProvider,
  teamsDarkV21Theme,
  teamsLightV21Theme,
  Theme,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import React, { ReactNode, useCallback, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import {
  HandyFluentUiContext,
  HandyFluentUiConfig,
  LoggingLevel,
  ThemeType,
} from '@context/handy-fluent-ui-context';

import { BreadcrumbProvider } from './breadcrumb-provider';
import { DialogProvider } from './dialog-provider';
import { SpinnerProvider } from './spinner-provider';
import { ToastProvider } from './toast-provider';

// ─── Theme constants ─────────────────────────────────────────────────────────

type ThemeMapping = {
  light?: Theme;
  dark?: Theme;
  custom?: Theme;
};

const DESKTOP_THEME = {
  light: webLightTheme,
  dark: webDarkTheme,
};

// Teams themes provide better mobile UX; Fluent web themes have known issues at mobile sizes
// (too-small font, components that don't fit the viewport).
const MOBILE_THEME = {
  light: teamsLightV21Theme,
  dark: teamsDarkV21Theme,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mergeThemeMapping = (
  input: ThemeMapping | undefined,
  defaults: ThemeMapping,
): ThemeMapping => ({
  light: input?.light ?? defaults.light,
  dark: input?.dark ?? defaults.dark,
  custom: input?.custom ?? defaults.custom,
});

const resolveThemeMapping = (supportedTheme?: HandyFluentUiConfig['supportedTheme']) => {
  // A custom theme is shared across both platforms unless each is explicitly overridden,
  // so consumers don't have to duplicate the same theme object for web and mobile.
  return {
    web: mergeThemeMapping(supportedTheme?.web, {
      ...DESKTOP_THEME,
      custom: supportedTheme?.mobile?.custom,
    }),
    mobile: mergeThemeMapping(supportedTheme?.mobile, {
      ...MOBILE_THEME,
      custom: supportedTheme?.web?.custom,
    }),
    default: supportedTheme?.default,
  };
};

const resolveDefaultThemeType = (
  defaultThemeType?: ThemeType,
  supportedTheme?: ThemeType[],
): ThemeType => {
  // If default theme type is not provided or is 'custom' but custom theme is not provided, use system preference with fallback to 'light'
  const fallbackThemeType = 'light';
  if (
    defaultThemeType === undefined ||
    (defaultThemeType === 'custom' && !supportedTheme?.includes('custom'))
  ) {
    if (typeof window === 'undefined') {
      return fallbackThemeType; // SSR fallback
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return defaultThemeType ?? fallbackThemeType;
};

// ─── Provider ────────────────────────────────────────────────────────────────

const defaultHandyFluentUiConfig = {
  mobileBreakpoint: 600,
  supportedLanguage: { iso: 'en', name: 'English' },
  supportedTheme: {
    web: DESKTOP_THEME,
    mobile: MOBILE_THEME,
  },
};

type HandyFluentUiProviderProps = HandyFluentUiConfig & {
  children: ReactNode;
};

const HandyFluentUiProvider = ({
  mobileBreakpoint,
  component,
  supportedTheme,
  loggerConfig: logMessageConfig,
  children,
}: HandyFluentUiProviderProps) => {
  // resolve theme mapping with fallback to default themes if not provided
  const resolvedThemeMapping = resolveThemeMapping(supportedTheme);
  const supportedThemeType: ThemeType[] =
    resolvedThemeMapping.web.custom || resolvedThemeMapping.mobile.custom
      ? ['light', 'dark', 'custom']
      : ['light', 'dark'];
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(
    resolveDefaultThemeType(supportedTheme?.default, supportedThemeType),
  );
  const resolvedBreakpoint = mobileBreakpoint ?? defaultHandyFluentUiConfig.mobileBreakpoint;

  const isMobile = useMediaQuery(`(max-width: ${resolvedBreakpoint}px)`);
  const fluentTheme = isMobile
    ? resolvedThemeMapping.mobile[currentTheme]
    : resolvedThemeMapping.web[currentTheme];
  const switchTheme = useCallback((themeType: ThemeType) => {
    setCurrentTheme(themeType);
  }, []);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const logMessage = useCallback(
    (message: string, level: LoggingLevel = 'info') => {
      if (logMessageConfig?.logMessage) {
        logMessageConfig.logMessage(message, level);
      } else {
        // eslint-disable-next-line no-console
        console.log(`[${level.toUpperCase()}] ${message}`);
      }
    },
    [logMessageConfig],
  );

  return (
    <HandyFluentUiContext.Provider
      value={{
        logMessage,
        mobileBreakpoint: resolvedBreakpoint,
        selectedTheme: currentTheme,
        supportedThemeType,
        switchTheme,
        timeZone,
      }}
    >
      <FluentProvider theme={fluentTheme}>
        <SpinnerProvider config={component?.spinner}>
          <DialogProvider>
            <ToastProvider config={component?.toast}>
              <BreadcrumbProvider>{children}</BreadcrumbProvider>
            </ToastProvider>
          </DialogProvider>
        </SpinnerProvider>
      </FluentProvider>
    </HandyFluentUiContext.Provider>
  );
};

export { HandyFluentUiProvider, resolveDefaultThemeType };
export type { HandyFluentUiProviderProps };
