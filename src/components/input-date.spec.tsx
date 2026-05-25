import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiInputDate } from './input-date';

// Mock Fluent UI components
vi.mock('@fluentui/react-components', () => {
  return {
    Label: ({ children, htmlFor, required, className }: any) => (
      <label className={className} htmlFor={htmlFor}>
        {children}
        {required && <span>*</span>}
      </label>
    ),
    InfoLabel: ({ children, htmlFor, required, info }: any) => (
      <label htmlFor={htmlFor}>
        {children}
        {required && <span>*</span>}
        <span data-testid="info-hint">{info}</span>
      </label>
    ),
    Caption1: ({ children, className }: any) => <span className={className}>{children}</span>,
    Input: (props: any) => (
      <div className={props.className} data-testid="fluent-input-wrapper" onClick={props.onClick} style={props.style}>
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
    Button: (props: any) => (
      <button data-testid="fluent-button" onClick={props.onClick} type="button">
        {props.icon}
        {props.children}
      </button>
    ),
    OverlayDrawer: ({ children, open, onOpenChange }: any) =>
      open ? (
        <div data-testid="fluent-drawer">
          <button onClick={() => onOpenChange(null, { open: false })}>Close</button>
          {children}
        </div>
      ) : null,
    DrawerBody: ({ children }: any) => <div data-testid="drawer-body">{children}</div>,
    DrawerHeader: ({ children, className }: any) => <div className={className} data-testid="drawer-header">{children}</div>,
    DrawerHeaderTitle: ({ children }: any) => <div data-testid="drawer-title">{children}</div>,
    useId: (prefix: string) => `${prefix}-mock-id`,
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: {
      spacingVerticalXXS: '4px',
      spacingHorizontalM: '12px',
      colorPaletteRedForeground1: 'red',
      colorNeutralForeground3: 'grey',
    },
    makeStyles: () => () => ({
      labelContainer: 'label-container',
      eraserIcon: 'eraser-icon',
    }),
    webLightTheme: {},
  };
});

// Mock DatePicker compat
vi.mock('@fluentui/react-datepicker-compat', () => {
  return {
    DatePicker: (props: any) => {
      const displayValue = props.formatDate
        ? props.formatDate(props.value)
        : props.value
        ? props.value.toISOString()
        : '';
      return (
        <div className={props.className} data-testid="fluent-datepicker-wrapper" style={props.style}>
          <input
            data-testid="fluent-datepicker"
            id={props.id}
            onChange={(e) => {
              props.onSelectDate?.(new Date(e.target.value));
            }}
            placeholder={props.placeholder}
            value={displayValue}
          />
          {props.contentAfter && (
            <div data-testid="datepicker-content-after">
              {Array.isArray(props.contentAfter)
                ? props.contentAfter.map((child: any) => child)
                : props.contentAfter}
            </div>
          )}
        </div>
      );
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
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

describe('InputDate', () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it('renders with label and value', () => {
    const date = new Date('2023-01-01');
    render(<FuiInputDate label="Date Label" onChange={() => {}} value={date} />);

    expect(screen.getByText('Date Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue(date.toLocaleDateString())).toBeInTheDocument();
  });

  it('calls onChange when a date is selected', () => {
    const handleChange = vi.fn();
    render(<FuiInputDate label="Date" onChange={handleChange} value={null} />);

    const input = screen.getByTestId('fluent-datepicker');
    fireEvent.change(input, { target: { value: '2023-12-25' } });

    expect(handleChange).toHaveBeenCalled();
    // Verify it passed a Date object
    const calledArg = handleChange.mock.calls[0][0];
    expect(calledArg).toBeInstanceOf(Date);
  });

  it('handles empty value', () => {
    render(<FuiInputDate label="Date" onChange={() => {}} value={null} />);
    const input = screen.getByTestId('fluent-datepicker');
    expect(input).toHaveValue('');
  });

  it('uses custom formatter in desktop view', () => {
    const date = new Date('2023-01-01');
    const formatter = (d: Date | null) => (d ? `Custom: ${d.getFullYear()}` : 'None');
    render(<FuiInputDate formatter={formatter} label="Date" onChange={() => {}} value={date} />);

    expect(screen.getByDisplayValue('Custom: 2023')).toBeInTheDocument();
  });

  it('uses custom formatter in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    const date = new Date('2023-01-01');
    const formatter = (d: Date | null) => (d ? `Mobile: ${d.getFullYear()}` : 'None');
    render(<FuiInputDate formatter={formatter} label="Mobile Date" onChange={() => {}} value={date} />);

    expect(screen.getByDisplayValue('Mobile: 2023')).toBeInTheDocument();
  });

  it('renders Input in mobile view', () => {
    mockIsMobile.mockReturnValue(true);

    const date = new Date('2023-01-01');
    render(<FuiInputDate label="Mobile Date" onChange={() => {}} value={date} />);

    const input = screen.getByTestId('fluent-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue(date.toLocaleDateString());
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('clears value when eraser is clicked in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    const handleChange = vi.fn();
    const date = new Date('2023-01-01');
    render(<FuiInputDate label="Mobile Date" onChange={handleChange} value={date} />);

    const eraser = screen.getByTestId('eraser-icon');
    fireEvent.click(eraser);

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('opens drawer on click in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    render(<FuiInputDate label="Mobile Date" onChange={() => {}} value={null} />);

    const input = screen.getByTestId('fluent-input');
    fireEvent.click(input);

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-calendar')).toBeInTheDocument();
  });

  it('opens drawer on icon click in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    render(<FuiInputDate label="Mobile Date" onChange={() => {}} value={null} />);

    const icon = screen.getByTestId('calendar-icon');
    fireEvent.click(icon);

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
  });

  it('updates value and closes drawer when date is selected in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    const handleChange = vi.fn();
    render(<FuiInputDate label="Mobile Date" onChange={handleChange} value={null} />);

    const input = screen.getByTestId('fluent-input');
    fireEvent.click(input);

    const selectBtn = screen.getByText('Select Dec 25');
    fireEvent.click(selectBtn);

    expect(handleChange).toHaveBeenCalledWith(new Date('2023-12-25'));
    expect(screen.queryByTestId('fluent-drawer')).not.toBeInTheDocument();
  });

  it('blocks typing in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    render(<FuiInputDate label="Mobile Date" onChange={() => {}} value={null} />);
    const input = screen.getByTestId('fluent-input');

    const keyDownEvent = createEvent.keyDown(input, { key: 'a' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(true);
  });

  it('renders eraser icon and clears value when provided', () => {
    const handleChange = vi.fn();
    render(<FuiInputDate label="Test" onChange={handleChange} value={new Date()} />);

    const eraser = screen.getByTestId('eraser-icon');
    expect(eraser).toBeInTheDocument();

    fireEvent.click(eraser);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('supports className and style in desktop view', () => {
    const customStyle = { color: 'cyan' };
    render(
      <FuiInputDate
        className="custom-date-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
        value={null}
      />,
    );
    const wrapper = screen.getByTestId('fluent-datepicker-wrapper');
    expect(wrapper).toHaveClass('custom-date-class');
    expect(wrapper).toHaveStyle('color: rgb(0, 255, 255)');
  });

  it('supports className and style in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    const customStyle = { color: 'magenta' };
    render(
      <FuiInputDate
        className="custom-mobile-date-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
        value={null}
      />,
    );
    const wrapper = screen.getByTestId('fluent-input-wrapper');
    expect(wrapper).toHaveClass('custom-mobile-date-class');
    expect(wrapper).toHaveStyle('color: rgb(255, 0, 255)');
  });
});
