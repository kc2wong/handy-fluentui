import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiInputNumber } from './input-number';

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  return {
    FluentProvider: ({ children }: any) => <div>{children}</div>,
    Input: (props: any) => (
      <div data-testid="fluent-input-wrapper">
        <input 
          className={props.className}
          data-testid="fluent-input" 
          id={props.id}
          onBlur={props.onBlur} 
          onChange={(e) => props.onChange?.(e, { value: e.target.value })}
          onFocus={props.onFocus}
          onKeyDown={props.onKeyDown}
          placeholder={props.placeholder}
          style={props.style}
          value={props.value} 
        />
        {props.contentAfter && <div data-testid="content-after">{props.contentAfter}</div>}
      </div>
    ),
    SpinButton: (props: any) => (
      <div className={props.className} data-testid="fluent-spinbutton" style={props.style}>
        <input
          id={props.id}
          onBlur={props.onBlur}
          onChange={(e) => props.onChange?.(e, { value: parseFloat(e.target.value) })}
          onFocus={props.onFocus}
          onKeyDown={props.onKeyDown}
          value={props.displayValue ?? props.value ?? ''}
        />
        <button onClick={() => props.onChange?.(null, { value: (props.value ?? 0) + (props.step ?? 1) })}>Up</button>
        <button onClick={() => props.onChange?.(null, { value: (props.value ?? 0) - (props.step ?? 1) })}>Down</button>
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
      spacingHorizontalXS: '4px',
      fontSizeBase500: '20px',
    },
    makeStyles: () => () => ({
      labelContainer: 'label-container',
      eraserIcon: 'eraser-icon',
      arrows: 'arrows',
      arrowIcon: 'arrow-icon',
    }),
    webLightTheme: {},
  };
});

vi.mock('@fluentui/react-icons', () => ({
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
  ChevronUpRegular: ({ onClick, className }: any) => <span className={className} data-testid="up-arrow" onClick={onClick} />,
  ChevronDownRegular: ({ onClick, className }: any) => <span className={className} data-testid="down-arrow" onClick={onClick} />,
}));

describe('InputNumber', () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it('renders with label and initial value', () => {
    render(<FuiInputNumber label="Price" onChange={() => {}} value={100.5} />);
    
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100.5')).toBeInTheDocument();
  });

  it('allows typing numbers and decimal point', () => {
    const handleChange = vi.fn();
    render(<FuiInputNumber label="Price" onChange={handleChange} precision={2} value={null} />);

    const input = screen.getByTestId('fluent-input');
    
    fireEvent.change(input, { target: { value: '12.3' } });
    expect(handleChange).toHaveBeenLastCalledWith(12.3);
  });

  it('blocks negative sign when allowNegative is false', () => {
    render(<FuiInputNumber allowNegative={false} label="Age" onChange={() => {}} value={null} />);
    const input = screen.getByTestId('fluent-input');
    
    const keyDownEvent = fireEvent.keyDown(input, { key: '-' });
    expect(keyDownEvent).toBe(false);
  });

  it('blocks decimal point when precision is 0', () => {
    render(<FuiInputNumber label="Count" onChange={() => {}} precision={0} value={null} />);
    const input = screen.getByTestId('fluent-input');
    
    const keyDownEvent = fireEvent.keyDown(input, { key: '.' });
    expect(keyDownEvent).toBe(false);
  });

  it('renders SpinButton when step is provided and triggers onChange via buttons', () => {
    const handleChange = vi.fn();
    render(<FuiInputNumber label="Count" min={1} onChange={handleChange} step={1} value={5} />);

    expect(screen.getByTestId('fluent-spinbutton')).toBeInTheDocument();
    const input = screen.getByTestId('fluent-spinbutton').querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('5');

    const upButton = screen.getByText('Up');
    fireEvent.click(upButton);
    expect(handleChange).toHaveBeenCalledWith(6);

    const downButton = screen.getByText('Down');
    fireEvent.click(downButton);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('applies formatter to SpinButton when provided', () => {
    const formatter = (val: number) => `$${val.toFixed(2)}`;
    render(<FuiInputNumber formatter={formatter} label="Price" onChange={() => {}} step={1} value={100} />);

    const input = screen.getByTestId('fluent-spinbutton').querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('$100.00');
  });

  it('disables typing in SpinButton', () => {
    render(<FuiInputNumber label="Count" onChange={() => {}} step={1} value={5} />);
    const input = screen.getByTestId('fluent-spinbutton').querySelector('input') as HTMLInputElement;
    
    const keyDownEvent = fireEvent.keyDown(input, { key: 'a' });
    expect(keyDownEvent).toBe(false);
    
    const digitEvent = fireEvent.keyDown(input, { key: '1' });
    expect(digitEvent).toBe(false);

    const backspaceEvent = fireEvent.keyDown(input, { key: 'Backspace' });
    expect(backspaceEvent).toBe(false);
  });

  it('applies formatter when not in focus', () => {
    const formatter = (val: number) => `$${val.toFixed(2)}`;
    render(<FuiInputNumber formatter={formatter} label="Price" onChange={() => {}} value={100} />);

    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    expect(input.value).toBe('$100.00');

    fireEvent.focus(input);
    expect(input.value).toBe('100');

    fireEvent.blur(input);
    expect(input.value).toBe('$100.00');
  });

  it('cleans up invalid input on blur', () => {
    const handleChange = vi.fn();
    render(<FuiInputNumber label="Price" onChange={handleChange} value={null} />);

    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '.' } });
    expect(input.value).toBe('.');
    
    fireEvent.blur(input);
    expect(input.value).toBe('');
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('renders eraser icon and clears value when provided', () => {
    const handleChange = vi.fn();
    render(<FuiInputNumber label="Test" onChange={handleChange} value={123} />);

    const eraser = screen.getByTestId('eraser-icon');
    expect(eraser).toBeInTheDocument();

    fireEvent.click(eraser);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('does not render eraser icon when readOnly is true', () => {
    render(<FuiInputNumber label="Test" onChange={() => {}} readOnly value={123} />);
    expect(screen.queryByTestId('eraser-icon')).not.toBeInTheDocument();
  });

  it('does not render eraser icon when disabled is true', () => {
    render(<FuiInputNumber disabled label="Test" onChange={() => {}} value={123} />);
    expect(screen.queryByTestId('eraser-icon')).not.toBeInTheDocument();
  });

  it('supports className and style in normal mode', () => {
    const customStyle = { color: 'purple' };
    render(
      <FuiInputNumber
        className="custom-number-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
        value={null}
      />,
    );
    const input = screen.getByTestId('fluent-input');
    expect(input).toHaveClass('custom-number-class');
    expect(input).toHaveStyle('color: rgb(128, 0, 128)');
  });

  it('supports className and style in SpinButton mode', () => {
    const customStyle = { color: 'orange' };
    render(
      <FuiInputNumber
        className="custom-spinbutton-class"
        label="Test"
        onChange={() => {}}
        step={1}
        style={customStyle}
        value={5}
      />,
    );
    const spinButton = screen.getByTestId('fluent-spinbutton');
    expect(spinButton).toHaveClass('custom-spinbutton-class');
    expect(spinButton).toHaveStyle('color: rgb(255, 165, 0)');
  });

  it('renders horizontal arrows on mobile in SpinButton mode', () => {
    mockIsMobile.mockReturnValue(true);
    render(<FuiInputNumber label="Count" onChange={() => {}} step={1} value={5} />);

    expect(screen.getByTestId('fluent-input-wrapper')).toBeInTheDocument();
    const arrowsContainer = screen.getByTestId('up-arrow').parentElement;
    expect(arrowsContainer).toHaveClass('arrows');
    expect(screen.getByTestId('up-arrow')).toBeInTheDocument();
    expect(screen.getByTestId('down-arrow')).toBeInTheDocument();
  });
});
