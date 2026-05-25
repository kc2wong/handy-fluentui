import {
  BrandVariants,
  createLightTheme,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import { HandyFluentUiProvider } from '@provider/handy-fluent-ui-provider';

import App from './App';

// ─── Kids theme ───────────────────────────────────────────────────────────────
// A vivid purple-violet palette that feels playful and colourful for children.
const kidsBrand: BrandVariants = {
  10: '#fff7f0',
  20: '#ffebd9',
  30: '#ffd5b3',
  40: '#ffb784',
  50: '#ff914d',
  60: '#ff7000', // primary color
  70: '#e65f00',
  80: '#cc5000',
  90: '#b34400',
  100: '#993800',
  110: '#802d00',
  120: '#662200',
  130: '#4d1900',
  140: '#331000',
  150: '#1a0800',
  160: '#0d0400',
};

// Create a new light theme with your brand
const kidsTheme = {
  ...createLightTheme(kidsBrand),

  // Override global color tokens or component styles
  colorNeutralForeground1: '#333333',
  colorBrandForeground1: kidsBrand[60],
  fontFamilyBase: '"Comic Sans MS", "Fredoka", cursive, sans-serif',
  fontSizeBase300: '14px',
  fontSizeBase400: '16px',
  fontSizeBase500: '18px',

  // Optional: Make headings a bit playful
  fontFamilyHeading: '"Fredoka", "Comic Sans MS", cursive, sans-serif',
};

// ─── i18n component labels ────────────────────────────────────────────────────

export type Lang = 'en' | 'zh-TW';

const makeComponentConfig = (lang: Lang) => ({
  toast: {
    dismissTimeout: 3000,
    label:
      lang === 'en'
        ? { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' }
        : { success: '成功', error: '錯誤', info: '資訊', warning: '警告' },
  },
});

// ─── Mobile simulation context (demo-only) ────────────────────────────────────

type MobileSimContextType = {
  forceMobile: boolean;
  toggleMobile: () => void;
};

export const MobileSimContext = createContext<MobileSimContextType>({
  forceMobile: false,
  toggleMobile: () => {},
});

export const useMobileSim = () => useContext(MobileSimContext);

// ─── Root ─────────────────────────────────────────────────────────────────────

const Root = () => {
  const [lang, setLang] = useState<Lang>('en');
  const [forceMobile, setForceMobile] = useState(false);

  const app = (
    <App
      lang={lang}
      onToggleLang={() => setLang((l) => (l === 'en' ? 'zh-TW' : 'en'))}
    />
  );

  return (
    <MobileSimContext.Provider value={{ forceMobile, toggleMobile: () => setForceMobile((m) => !m) }}>
      <HandyFluentUiProvider
        component={makeComponentConfig(lang)}
        supportedTheme={{
          web: { custom: kidsTheme, dark: webDarkTheme, light: webLightTheme },
          default: 'light',
        }}
      >
        {forceMobile ? (
          // ── Phone-frame shell ─────────────────────────────────────────────────
          // Outer div = desktop background; inner div = phone bezel + screen.
          <div style={{
            alignItems: 'flex-start',
            background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px 16px',
          }}>
            <div style={{
              backgroundColor: '#111',
              borderRadius: '52px',
              boxShadow: '0 0 0 2px #2a2a2a, 0 0 0 6px #111, 0 40px 100px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 48px)',
              overflow: 'hidden',
              padding: '14px',
              width: '393px',
            }}>
              {/* Dynamic Island */}
              <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'center', marginBottom: '4px' }}>
                <div style={{ backgroundColor: '#000', borderRadius: '20px', height: '36px', width: '126px' }} />
              </div>
              {/* Screen — scrollable content area */}
              <div style={{ backgroundColor: '#fff', borderRadius: '38px', flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
                {app}
              </div>
              {/* Home indicator */}
              <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'center', padding: '10px 0 4px' }}>
                <div style={{ backgroundColor: '#555', borderRadius: '3px', height: '5px', width: '130px' }} />
              </div>
            </div>
          </div>
        ) : app}
      </HandyFluentUiProvider>
    </MobileSimContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
