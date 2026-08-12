import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { FuiTooltip } from './fui-tooltip';

vi.mock('@fluentui/react-components', () => {
  const PopoverContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  } | null>(null);

  const Popover = ({ children, open, onOpenChange, positioning }: any) => (
    <div data-open={open} data-positioning={positioning} data-testid="popover-root">
      <PopoverContext.Provider
        value={{
          open,
          onOpenChange: (next: boolean) => onOpenChange?.(undefined, { open: next }),
        }}
      >
        {children}
      </PopoverContext.Provider>
    </div>
  );

  const PopoverTrigger = ({ children }: any) => {
    const ctx = React.useContext(PopoverContext);
    return React.cloneElement(children, {
      onClick: (e: any) => {
        children.props.onClick?.(e);
        ctx?.onOpenChange(!ctx.open);
      },
    });
  };

  const PopoverSurface = ({ children }: any) => {
    const ctx = React.useContext(PopoverContext);
    return ctx?.open ? <div data-testid="popover-surface">{children}</div> : null;
  };

  return {
    Tooltip: ({ children, content, positioning }: any) => (
      <div data-positioning={positioning} data-testid="tooltip-wrapper" title={content}>
        {children}
      </div>
    ),
    Popover,
    PopoverTrigger,
    PopoverSurface,
  };
});

describe('FuiTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('hover mode (default)', () => {
    it('wraps children in a Tooltip with the message as content', () => {
      render(
        <FuiTooltip text="Helpful hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute('title', 'Helpful hint');
      expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    });

    it('maps position to the corresponding Fluent positioning value', () => {
      render(
        <FuiTooltip position="left" text="Hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute('data-positioning', 'before');
    });

    it('leaves positioning unset when position is not provided', () => {
      render(
        <FuiTooltip text="Hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      expect(screen.getByTestId('tooltip-wrapper')).not.toHaveAttribute('data-positioning');
    });
  });

  describe('click mode', () => {
    it('does not show the message until the trigger is clicked', () => {
      render(
        <FuiTooltip showOn="click" text="Click hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      expect(screen.queryByTestId('popover-surface')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));

      expect(screen.getByTestId('popover-surface')).toHaveTextContent('Click hint');
    });

    it('auto-dismisses after the default 2000ms of inactivity', () => {
      render(
        <FuiTooltip showOn="click" text="Click hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
      expect(screen.getByTestId('popover-surface')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.queryByTestId('popover-surface')).not.toBeInTheDocument();
    });

    it('respects a custom dismissMs', () => {
      render(
        <FuiTooltip dismissMs={500} showOn="click" text="Click hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));

      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(screen.getByTestId('popover-surface')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByTestId('popover-surface')).not.toBeInTheDocument();
    });

    it('maps position to the corresponding Fluent positioning value', () => {
      render(
        <FuiTooltip position="right" showOn="click" text="Hint">
          <button type="button">Trigger</button>
        </FuiTooltip>,
      );

      expect(screen.getByTestId('popover-root')).toHaveAttribute('data-positioning', 'after');
    });
  });

  describe('disabled children', () => {
    it('renders a natively-disabled child as-is with no tooltip wrapper', () => {
      render(
        <FuiTooltip text="Should not show">
          <button disabled type="button">
            Trigger
          </button>
        </FuiTooltip>,
      );

      expect(screen.queryByTestId('tooltip-wrapper')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Trigger' })).toBeDisabled();
    });

    it('renders an aria-disabled child as-is with no popover wrapper', () => {
      render(
        <FuiTooltip showOn="click" text="Should not show">
          <button aria-disabled="true" type="button">
            Trigger
          </button>
        </FuiTooltip>,
      );

      expect(screen.queryByTestId('popover-root')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
      expect(screen.queryByTestId('popover-surface')).not.toBeInTheDocument();
    });
  });
});
