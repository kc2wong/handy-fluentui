import { useContext } from 'react';

import { HandyFluentUiContext, ThemeType } from '@context/handy-fluent-ui-context';

/** Returns the current theme and a guarded switchTheme that only accepts values in supportedThemeType. */
const useTheme = () => {
  const ctx = useContext(HandyFluentUiContext);
  if (!ctx) {
    throw new Error('useTheme must be used within HandyFluentUiProvider');
  }

  const { selectedTheme, supportedThemeType, switchTheme } = ctx;
  return {
    currentTheme: selectedTheme,
    switchTheme: (themeType: ThemeType) => {
      // only switch if the themeType is in the supported list to prevent invalid theme switch
      supportedThemeType.includes(themeType) && switchTheme(themeType);
    },
  };
};

export { useTheme };
