import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

import { HandyFluentUiProvider } from './handy-fluent-ui-provider';

// Mock nested providers to avoid their side effects
vi.mock('./spinner-provider', () => ({
  SpinnerProvider: ({ children }: any) => <div data-testid="spinner-provider">{children}</div>,
}));

vi.mock('./dialog-provider', () => ({
  DialogProvider: ({ children }: any) => <div data-testid="dialog-provider">{children}</div>,
}));

vi.mock('./toast-provider', () => ({
  ToastProvider: ({ children }: any) => <div data-testid="toast-provider">{children}</div>,
}));

// Mock Fluent UI components
vi.mock('@fluentui/react-components', () => ({
  FluentProvider: ({ children, theme }: any) => (
    <div data-testid="fluent-provider" data-theme={JSON.stringify(theme)}>
      {children}
    </div>
  ),
  webLightTheme: { name: 'light-theme' },
  webDarkTheme: { name: 'dark-theme' },
  teamsLightV21Theme: { name: 'teams-light-theme' },
  teamsDarkV21Theme: { name: 'teams-dark-theme' },
}));

// Mock useMediaQuery since it's used in HandyFluentUiProvider
vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(),
}));

const TestComponent = () => {
  const config = React.useContext(HandyFluentUiContext)!;
  return (
    <div>
      <span data-testid="breakpoint">{config.mobileBreakpoint}</span>
      <span data-testid="theme">{config.selectedTheme}</span>
      <button
        onClick={() =>
          config.switchTheme(config.selectedTheme === 'light' ? 'dark' : 'light')
        }
      >
        Toggle
      </button>
      <button onClick={() => config.logMessage('test message', 'warn')}>Log Message</button>
    </div>
  );
};

describe('HandyFluentUiProvider', () => {
  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  it('renders children wrapped in necessary providers', () => {
    render(
      <HandyFluentUiProvider>
        <div data-testid="child">Content</div>
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('spinner-provider')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-provider')).toBeInTheDocument();
  });

  it('provides default configuration', () => {
    render(
      <HandyFluentUiProvider>
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('breakpoint')).toHaveTextContent('600');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('applies custom configuration', () => {
    render(
      <HandyFluentUiProvider mobileBreakpoint={800}>
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('breakpoint')).toHaveTextContent('800');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('applies correct Fluent UI theme based on theme type', () => {
    render(
      <HandyFluentUiProvider>
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('fluent-provider')).toHaveAttribute(
      'data-theme',
      JSON.stringify({ name: 'light-theme' }),
    );

    fireEvent.click(screen.getByText('Toggle'));

    expect(screen.getByTestId('fluent-provider')).toHaveAttribute(
      'data-theme',
      JSON.stringify({ name: 'dark-theme' }),
    );
  });

  it('toggles theme when toggleTheme is called', () => {
    render(
      <HandyFluentUiProvider>
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    const themeSpan = screen.getByTestId('theme');
    const toggleButton = screen.getByText('Toggle');
    const fluentProvider = screen.getByTestId('fluent-provider');

    expect(themeSpan).toHaveTextContent('light');
    expect(fluentProvider).toHaveAttribute('data-theme', JSON.stringify({ name: 'light-theme' }));

    fireEvent.click(toggleButton);

    expect(themeSpan).toHaveTextContent('dark');
    expect(fluentProvider).toHaveAttribute('data-theme', JSON.stringify({ name: 'dark-theme' }));

    fireEvent.click(toggleButton);

    expect(themeSpan).toHaveTextContent('light');
    expect(fluentProvider).toHaveAttribute('data-theme', JSON.stringify({ name: 'light-theme' }));
  });

  it('uses explicit default theme type when provided', () => {
    render(
      <HandyFluentUiProvider
        supportedTheme={{ default: 'dark' }}
      >
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('fluent-provider')).toHaveAttribute(
      'data-theme',
      JSON.stringify({ name: 'dark-theme' }),
    );
  });

  it('supports custom theme when provided', () => {
    const customTheme = { name: 'custom-theme' } as any;
    render(
      <HandyFluentUiProvider
        supportedTheme={{
          web: { custom: customTheme },
          default: 'custom',
        }}
      >
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('custom');
    expect(screen.getByTestId('fluent-provider')).toHaveAttribute(
      'data-theme',
      JSON.stringify(customTheme),
    );
  });

  it('falls back to system preference when custom theme is requested but not provided', () => {
    // Mock system preference to dark
    vi.mocked(window.matchMedia).mockReturnValueOnce({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any);

    render(
      <HandyFluentUiProvider
        supportedTheme={{ default: 'custom' }}
      >
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('uses fallback theme when window is undefined (SSR)', async () => {
    const originalWindow = globalThis.window;
    // @ts-ignore
    delete globalThis.window;

    const { resolveDefaultThemeType } = await import('./handy-fluent-ui-provider');
    expect(resolveDefaultThemeType(undefined, ['light', 'dark'])).toBe('light');

    globalThis.window = originalWindow;
  });

  it('applies mobile theme when mobile breakpoint matches', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);

    render(
      <HandyFluentUiProvider>
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    expect(screen.getByTestId('fluent-provider')).toHaveAttribute(
      'data-theme',
      JSON.stringify({ name: 'teams-light-theme' }),
    );
  });

  it('calls custom logger when provided', () => {
    const logMessage = vi.fn();
    render(
      <HandyFluentUiProvider
        loggerConfig={{ logMessage }}
      >
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    fireEvent.click(screen.getByText('Log Message'));
    expect(logMessage).toHaveBeenCalledWith('test message', 'warn');
  });

  it('falls back to console.log when no logger is provided', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(
      <HandyFluentUiProvider>
        <TestComponent />
      </HandyFluentUiProvider>,
    );

    fireEvent.click(screen.getByText('Log Message'));
    expect(consoleSpy).toHaveBeenCalledWith('[WARN] test message');
    consoleSpy.mockRestore();
  });
});
