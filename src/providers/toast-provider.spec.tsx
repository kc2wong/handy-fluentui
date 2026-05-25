import { render, screen, act } from '@testing-library/react';
import React, { useContext } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';
import { FuiToastContext } from '@context/toast-context';

import { ToastProvider } from './toast-provider';

// Mock Fluent UI components
const mockDispatchToast = vi.fn();
const mockUpdateToast = vi.fn();
vi.mock('@fluentui/react-components', () => ({
  useToastController: () => ({
    dispatchToast: mockDispatchToast,
    updateToast: mockUpdateToast,
  }),
  Toaster: () => <div data-testid="toaster" />,
  Toast: ({ children }: any) => <div data-testid="toast">{children}</div>,
  ToastTitle: ({ children, action }: any) => (
    <div data-testid="toast-title">
      {children}
      {action && <div data-testid="toast-action">{action}</div>}
    </div>
  ),
  ToastBody: ({ children }: any) => <div data-testid="toast-body">{children}</div>,
  ToastTrigger: ({ children }: any) => <div data-testid="toast-trigger">{children}</div>,
  Link: ({ children }: any) => <span data-testid="toast-link">{children}</span>,
  webLightTheme: {},
}));

vi.mock('@fluentui/react-icons', () => ({
  DismissRegular: () => <span data-testid="dismiss-icon" />,
}));

const TestComponent = ({
  message,
  dismissLabel,
  intent,
}: {
  message: string;
  dismissLabel?: string;
  intent?: any;
}) => {
  const { show } = useContext(FuiToastContext);
  return <button onClick={() => show(message, dismissLabel, intent)}>Show Toast</button>;
};

describe('ToastProvider', () => {
  const renderWithContext = (ui: React.ReactNode, component?: any) => {
    return render(
      <HandyFluentUiContext.Provider
        value={
          {
            component,
          } as any
        }
      >
        {ui}
      </HandyFluentUiContext.Provider>,
    );
  };

  beforeEach(() => {
    mockDispatchToast.mockClear();
    mockUpdateToast.mockClear();
  });

  it('renders children correctly', () => {
    renderWithContext(
      <ToastProvider>
        <div data-testid="child">Child Content</div>
      </ToastProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('uses message as ToastTitle when no title is resolved and omits ToastBody', () => {
    renderWithContext(
      <ToastProvider>
        <TestComponent intent="info" message="Simple Message" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    const toastElement = mockDispatchToast.mock.calls[0][0];
    const toastTitle = toastElement.props.children;
    expect(toastTitle.props.children).toContain('Simple Message');
  });

  it('renders both ToastTitle and ToastBody when title is resolved via ComponentLabel', () => {
    const component = {
      toast: {
        label: { success: 'SUCCESS_TITLE' },
      },
    };

    renderWithContext(
      <ToastProvider config={component.toast}>
        <TestComponent intent="success" message="The actual message" />
      </ToastProvider>,
      component,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    const toastElement = mockDispatchToast.mock.calls[0][0];
    const fragmentChildren = toastElement.props.children.props.children;
    expect(fragmentChildren[0].props.children).toContain('SUCCESS_TITLE');
    expect(fragmentChildren[1].props.children).toBe('The actual message');
  });

  it('uses toastCreator when provided', () => {
    const toastCreator = (message: string) => (
      <div data-testid="custom-toast">{message}</div>
    );
    renderWithContext(
      <ToastProvider config={{ toastCreator: toastCreator as any }}>
        <TestComponent message="Custom Message" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalled();
    const toastElement = mockDispatchToast.mock.calls[0][0];
    expect(toastElement.props['data-testid']).toBe('custom-toast');
    expect(toastElement.props.children).toBe('Custom Message');
  });

  it('uses dismissLabel from ComponentLabel as fallback', () => {
    const component = {
      toast: {
        label: { dismiss: 'Config Dismiss' },
      },
    };

    renderWithContext(
      <ToastProvider config={component.toast}>
        <TestComponent message="Test Message" />
      </ToastProvider>,
      component,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalled();
    const toastElement = mockDispatchToast.mock.calls[0][0];
    const action = toastElement.props.children.props.action;
    expect(action.props.children.props.children).toBe('Config Dismiss');
  });

  it('prefers dismissLabel from show() call over ComponentLabel', () => {
    const component = {
      toast: {
        label: { dismiss: 'Config Dismiss' },
      },
    };

    renderWithContext(
      <ToastProvider config={component.toast}>
        <TestComponent dismissLabel="Call Dismiss" message="Test Message" />
      </ToastProvider>,
      component,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalled();
    const toastElement = mockDispatchToast.mock.calls[0][0];
    const action = toastElement.props.children.props.action;
    expect(action.props.children.props.children).toBe('Call Dismiss');
  });

  it('uses dismissTimeout from config', () => {
    renderWithContext(
      <ToastProvider config={{ dismissTimeout: 5000 }}>
        <TestComponent intent="success" message="Test Timeout" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        timeout: 5000,
      }),
    );
  });

  it('error toast is never auto-dismissed (timeout is always -1)', () => {
    renderWithContext(
      <ToastProvider config={{ dismissTimeout: 5000 }}>
        <TestComponent intent="error" message="Error Message" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ timeout: -1 }),
    );
  });

  it('error toast has no dismiss action on initial dispatch when dismissTimeout is configured', () => {
    renderWithContext(
      <ToastProvider config={{ dismissTimeout: 3000 }}>
        <TestComponent intent="error" message="Error Message" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    // The dismiss button must not appear until dismissTimeout elapses
    const toastElement = mockDispatchToast.mock.calls[0][0];
    expect(toastElement.props.children.props.action).toBeUndefined();
  });

  it('error toast reveals dismiss action via updateToast after dismissTimeout', () => {
    vi.useFakeTimers();

    renderWithContext(
      <ToastProvider config={{ dismissTimeout: 3000 }}>
        <TestComponent intent="error" message="Error Message" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockUpdateToast).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockUpdateToast).toHaveBeenCalledOnce();
    const { content, timeout, toastId } = mockUpdateToast.mock.calls[0][0];
    // Still no auto-dismiss after update
    expect(timeout).toBe(-1);
    // toastId must match the one used in the initial dispatchToast
    expect(toastId).toBe(mockDispatchToast.mock.calls[0][1].toastId);
    // Dismiss action is now present
    expect(content.props.children.props.action).toBeDefined();

    vi.useRealTimers();
  });

  it('error toast shows dismiss action immediately when no dismissTimeout is configured', () => {
    renderWithContext(
      <ToastProvider>
        <TestComponent intent="error" message="Error Message" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ timeout: -1 }),
    );
    const toastElement = mockDispatchToast.mock.calls[0][0];
    expect(toastElement.props.children.props.action).toBeDefined();
    expect(mockUpdateToast).not.toHaveBeenCalled();
  });

  it('uses position from config', () => {
    renderWithContext(
      <ToastProvider config={{ position: 'bottom-start' }}>
        <TestComponent intent="success" message="Test Position" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });

    expect(mockDispatchToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        position: 'bottom-start',
      }),
    );
  });
});
