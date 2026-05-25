import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiMobileDate } from './input-date';

// Mock Fluent UI components
vi.mock('@fluentui/react-components', () => {
  return {
    Input: (props: any) => (
      <div data-testid="fluent-input-wrapper" onClick={props.onClick}>
        <input
          data-testid="fluent-input"
          id={props.id}
          onChange={(e) => props.onChange?.(e, { value: e.target.value })}
          onKeyDown={props.onKeyDown}
          placeholder={props.placeholder}
          type={props.type}
          value={props.value}
        />
        {props.contentAfter && (
          <div data-testid="content-after">
            {Array.isArray(props.contentAfter)
              ? props.contentAfter.map((child: any) => child)
              : props.contentAfter}
          </div>
        )}
      </div>
    ),
    OverlayDrawer: ({ children, open, onOpenChange }: any) =>
      open ? (
        <div data-testid="fluent-drawer">
          <button onClick={() => onOpenChange(null, { open: false })}>Close</button>
          {children}
        </div>
      ) : null,
    DrawerBody: ({ children }: any) => <div data-testid="drawer-body">{children}</div>,
    useId: (prefix: string) => `${prefix}-mock-id`,
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    makeStyles: () => () => ({
      drawer: 'drawer-class',
      calendarWrapper: 'calendar-wrapper-class',
    }),
    tokens: {
      spacingVerticalM: '12px',
    },
  };
});

// Mock Calendar compat
vi.mock('@fluentui/react-calendar-compat', () => {
  return {
    Calendar: (props: any) => (
      <div data-testid="fluent-calendar">
        <button onClick={() => props.onSelectDate(new Date('2023-12-25'))}>Select Dec 25</button>
      </div>
    ),
  };
});

vi.mock('@fluentui/react-icons', () => ({
  CalendarRegular: ({ onClick }: any) => <span data-testid="calendar-icon" onClick={onClick} />,
  DismissRegular: ({ onClick }: any) => <span data-testid="dismiss-icon" onClick={onClick} />,
}));

describe('MobileDate', () => {
  it('renders correctly with value', () => {
    const date = new Date('2023-01-01');
    render(<FuiMobileDate onChange={() => {}} value={date} />);

    const input = screen.getByTestId('fluent-input');
    expect(input).toHaveValue(date.toLocaleDateString());
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('opens drawer on input click', () => {
    render(<FuiMobileDate onChange={() => {}} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input'));

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-calendar')).toBeInTheDocument();
  });

  it('opens drawer on calendar icon click', () => {
    render(<FuiMobileDate onChange={() => {}} value={null} />);

    fireEvent.click(screen.getByTestId('calendar-icon'));

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
  });

  it('selects date and closes drawer', () => {
    const handleChange = vi.fn();
    render(<FuiMobileDate onChange={handleChange} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input'));
    fireEvent.click(screen.getByText('Select Dec 25'));

    expect(handleChange).toHaveBeenCalledWith(new Date('2023-12-25'));
    expect(screen.queryByTestId('fluent-drawer')).not.toBeInTheDocument();
  });

  it('blocks typing', () => {
    render(<FuiMobileDate onChange={() => {}} value={null} />);
    const input = screen.getByTestId('fluent-input');

    const keyDownEvent = createEvent.keyDown(input, { key: 'a' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(true);
  });
});
