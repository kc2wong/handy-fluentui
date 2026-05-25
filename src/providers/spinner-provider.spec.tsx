import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useSpinner } from '@hook/use-spinner';

import { SpinnerProvider } from './spinner-provider';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({
    overlay: 'overlay-class',
  }),
  Spinner: ({ label }: any) => <div data-testid="fluent-spinner">{label}</div>,
  webLightTheme: {},
}));

const TestComponent = ({ label }: { label?: string }) => {
  const spinner = useSpinner();
  return (
    <div>
      <button onClick={() => spinner.show(label)}>Show</button>
      <button onClick={() => spinner.hide()}>Hide</button>
    </div>
  );
};

describe('SpinnerProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <SpinnerProvider>
        <div data-testid="child">Child Content</div>
      </SpinnerProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shows spinner after 300ms delay when show is called', () => {
    render(
      <SpinnerProvider>
        <TestComponent label="Loading..." />
      </SpinnerProvider>
    );

    act(() => {
      screen.getByText('Show').click();
    });

    // Should not show immediately
    expect(screen.queryByTestId('fluent-spinner')).not.toBeInTheDocument();

    // Advance time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('fluent-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-spinner')).toHaveTextContent('Loading...');
  });

  it('uses loadingLabel from props if no label provided in show', () => {
    const config = { label: { loading: () => 'Default loading...' } };
    render(
      <SpinnerProvider config={config}>
        <TestComponent />
      </SpinnerProvider>
    );

    act(() => {
      screen.getByText('Show').click();
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('fluent-spinner')).toHaveTextContent('Default loading...');
  });

  it('hides spinner when hide is called', () => {
    render(
      <SpinnerProvider>
        <TestComponent />
      </SpinnerProvider>
    );

    act(() => {
      screen.getByText('Show').click();
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('fluent-spinner')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click();
    });

    expect(screen.queryByTestId('fluent-spinner')).not.toBeInTheDocument();
  });

  it('handles multiple concurrent show calls correctly (reference counting)', () => {
    render(
      <SpinnerProvider>
        <TestComponent />
      </SpinnerProvider>
    );

    act(() => {
      screen.getByText('Show').click(); // count 1
      screen.getByText('Show').click(); // count 2
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('fluent-spinner')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click(); // count 1
    });

    // Still visible because count > 0
    expect(screen.getByTestId('fluent-spinner')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click(); // count 0
    });

    expect(screen.queryByTestId('fluent-spinner')).not.toBeInTheDocument();
  });
});
