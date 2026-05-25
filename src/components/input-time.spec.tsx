import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiInputTime } from './input-time';

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  return {
    Input: (props: any) => (
      <div data-testid="fluent-input-wrapper">
        {props.contentBefore && <div data-testid="content-before">{props.contentBefore}</div>}
        <input
          data-testid="fluent-input"
          id={props.id}
          onBlur={props.onBlur}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onKeyDown={props.onKeyDown}
          readOnly={props.readOnly}
          ref={props.input?.ref}
          style={props.input?.style}
          value={props.value}
        />
        {props.contentAfter && <div data-testid="content-after">{props.contentAfter}</div>}
      </div>
    ),
    Label: ({ children, htmlFor, required }: any) => (
      <label htmlFor={htmlFor}>
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
    useId: (prefix: string) => `${prefix}-mock-id`,
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: {
      spacingVerticalXXS: '4px',
      spacingHorizontalM: '12px',
      colorPaletteRedForeground1: 'red',
      colorNeutralForeground3: 'grey',
      fontSizeBase500: '20px',
      fontWeightSemibold: '600',
      spacingHorizontalXS: '4px',
    },
    makeStyles: () => () => ({
      arrows: 'arrows',
      arrowsRow: 'arrows-row',
      arrowIcon: 'arrow-icon',
      arrowIconMobile: 'arrow-icon-mobile',
      arrowIconDisabled: 'arrow-icon-disabled',
      amPm: 'am-pm',
      amPmDisabled: 'am-pm-disabled',
      labelContainer: 'label-container',
      eraserIcon: 'eraser-icon',
    }),
    webLightTheme: {},
  };
});

vi.mock('@fluentui/react-icons', () => ({
  ChevronUpRegular: ({ onClick, onMouseDown, className }: any) => (
    <span className={className} data-testid="up-arrow" onClick={onClick} onMouseDown={onMouseDown} />
  ),
  ChevronDownRegular: ({ onClick, onMouseDown, className }: any) => (
    <span className={className} data-testid="down-arrow" onClick={onClick} onMouseDown={onMouseDown} />
  ),
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

describe('InputTime', () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it('renders with label and initial value in 24h format', () => {
    const time = { hour: 14, minute: 30, second: 0 };
    render(<FuiInputTime label="Start Time" onChange={() => {}} value={time} />);

    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('renders in 12h format with AM/PM toggle', () => {
    const time = { hour: 14, minute: 30, second: 0 };
    render(<FuiInputTime in24HourFormat={false} label="Start Time" onChange={() => {}} value={time} />);

    expect(screen.getByDisplayValue('02:30')).toBeInTheDocument();
    expect(screen.getByText('PM')).toBeInTheDocument();
  });

  it('renders with seconds', () => {
    const time = { hour: 14, minute: 30, second: 45 };
    render(<FuiInputTime label="Start Time" onChange={() => {}} value={time} withSeconds />);

    expect(screen.getByDisplayValue('14:30:45')).toBeInTheDocument();
  });

  it('increments/decrements hours when hours segment is active', () => {
    const handleChange = vi.fn();
    const time = { hour: 10, minute: 0, second: 0 };
    render(<FuiInputTime onChange={handleChange} value={time} />);

    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    input.selectionStart = 0;
    fireEvent.click(input);

    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 11, minute: 0, second: 0 });

    fireEvent.click(screen.getByTestId('down-arrow'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 9, minute: 0, second: 0 });
  });

  it('increments/decrements active segment (minutes)', () => {
    const handleChange = vi.fn();
    const time = { hour: 10, minute: 30, second: 0 };
    render(<FuiInputTime onChange={handleChange} value={time} />);

    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    // Mock selection for minutes segment (pos 3-5)
    input.selectionStart = 4;
    fireEvent.click(input);

    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 10, minute: 31, second: 0 });
  });

  it('toggles AM/PM', () => {
    const handleChange = vi.fn();
    const time = { hour: 10, minute: 30, second: 0 };
    render(<FuiInputTime in24HourFormat={false} onChange={handleChange} value={time} />);

    fireEvent.click(screen.getByText('AM'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 22, minute: 30, second: 0 });
  });

  it('handles cascade carry', () => {
    const handleChange = vi.fn();
    const time = { hour: 10, minute: 59, second: 0 };
    render(<FuiInputTime cascadeCarry onChange={handleChange} value={time} />);

    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    input.selectionStart = 4; // Minutes
    fireEvent.click(input);

    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 11, minute: 0, second: 0 });
  });

  it('wraps around segments without carry when cascadeCarry is false', () => {
    const handleChange = vi.fn();
    const time = { hour: 10, minute: 59, second: 0 };
    render(<FuiInputTime cascadeCarry={false} onChange={handleChange} value={time} />);

    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    input.selectionStart = 4; // Minutes
    fireEvent.click(input);

    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 10, minute: 0, second: 0 });
  });

  it('applies mobile styles to arrows', () => {
    mockIsMobile.mockReturnValue(true);
    render(<FuiInputTime onChange={() => {}} value={null} />);

    const arrowsContainer = screen.getByTestId('up-arrow').parentElement;
    expect(arrowsContainer).toHaveClass('arrows-row');
    expect(screen.getByTestId('up-arrow')).toHaveClass('arrow-icon-mobile');
  });

  it('handles null value (defaults to minutes)', () => {
    const handleChange = vi.fn();
    render(<FuiInputTime onChange={handleChange} value={null} />);

    expect(screen.getByTestId('fluent-input')).toHaveValue('');
    
    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).toHaveBeenCalledWith({ hour: 0, minute: 1, second: 0 });
  });

  it('respects readOnly and disabled states', () => {
    const handleChange = vi.fn();
    const time = { hour: 10, minute: 0, second: 0 };
    
    const { rerender } = render(<FuiInputTime onChange={handleChange} readOnly value={time} />);
    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).not.toHaveBeenCalled();

    // Re-rendering with FuiInputTime disabled
    rerender(<FuiInputTime disabled onChange={handleChange} value={time} />);
    fireEvent.click(screen.getByTestId('up-arrow'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('clears value via eraser icon', () => {
    const handleChange = vi.fn();
    render(<FuiInputTime onChange={handleChange} value={{ hour: 10, minute: 0, second: 0 }} />);

    fireEvent.click(screen.getByTestId('eraser-icon'));
    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
