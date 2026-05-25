/* eslint-disable no-console */
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { useDialog } from '@hook/use-dialog';

import { DialogProvider } from './dialog-provider';

// Mock Fluent UI to avoid ESM/token issues
vi.mock('@fluentui/react-components', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="fluent-dialog">{children}</div> : null),
  DialogSurface: ({ children }: any) => <div data-testid="fluent-dialog-surface">{children}</div>,
  DialogBody: ({ children }: any) => <div data-testid="fluent-dialog-body">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="fluent-dialog-title">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="fluent-dialog-content">{children}</div>,
  DialogActions: ({ children }: any) => <div data-testid="fluent-dialog-actions">{children}</div>,
  Button: ({ children, onClick, appearance, disabled, icon }: any) => (
    <button data-appearance={appearance} disabled={disabled} onClick={onClick}>
      {icon}
      {children}
    </button>
  ),
  webLightTheme: {},
}));

const TestComponent = () => {
  const dialog = useDialog();
  return (
    <button onClick={() => dialog.openDialog({
      title: 'Confirm Delete',
      content: 'Are you sure?',
      primaryButton: { label: 'Delete', action: () => console.log('Deleted') },
      secondaryButton: { label: 'Cancel' }
    })}>Open Dialog</button>
  );
};

describe('DialogProvider', () => {
  it('renders children correctly', () => {
    render(
      <DialogProvider>
        <div data-testid="child">Child Content</div>
      </DialogProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders Dialog when openDialog is called', async () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));

    expect(screen.getByTestId('fluent-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-dialog-title')).toHaveTextContent('Confirm Delete');
    expect(screen.getByTestId('fluent-dialog-content')).toHaveTextContent('Are you sure?');
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('closes dialog and triggers action when primary button is clicked', () => {
    const primaryAction = vi.fn();
    const TestActionComponent = () => {
      const dialog = useDialog();
      return (
        <button onClick={() => dialog.openDialog({
          title: 'Title',
          content: 'Content',
          primaryButton: { label: 'Confirm', action: primaryAction }
        })}>Open</button>
      );
    };

    render(
      <DialogProvider>
        <TestActionComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Confirm'));

    expect(primaryAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('fluent-dialog')).not.toBeInTheDocument();
  });

  it('closes dialog when secondary button is clicked (even without action)', () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByTestId('fluent-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('fluent-dialog')).not.toBeInTheDocument();
  });

  it('reverses buttons (CTA should be rightmost in Fluent UI DialogActions typically)', () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    const buttons = screen.getByTestId('fluent-dialog-actions').querySelectorAll('button');
    
    // In DialogProvider: buttons = [primary, secondary].reverse() => [secondary, primary]
    expect(buttons[0]).toHaveTextContent('Cancel');
    expect(buttons[1]).toHaveTextContent('Delete');
  });

  it('applies primary appearance to cta button when multiple buttons exist', () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Delete')).toHaveAttribute('data-appearance', 'primary');
    expect(screen.getByText('Cancel')).toHaveAttribute('data-appearance', 'secondary');
  });

  it('applies secondary appearance if only one button exists', () => {
    const TestSingleButtonComponent = () => {
      const dialog = useDialog();
      return (
        <button onClick={() => dialog.openDialog({
          title: 'Title',
          content: 'Content',
          primaryButton: { label: 'OK', action: () => {} }
        })}>Open</button>
      );
    };

    render(
      <DialogProvider>
        <TestSingleButtonComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('OK')).toHaveAttribute('data-appearance', 'secondary');
  });
});
