import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiInputTextArea } from './input-textarea';

vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  return {
    FluentProvider: ({ children }: any) => <div>{children}</div>,
    Textarea: (props: any) => (
      <textarea 
        className={props.className}
        data-testid="fluent-textarea" 
        id={props.id}
        onBlur={props.onBlur} 
        onChange={(e) => props.onChange?.(e, { value: e.target.value })}
        onFocus={props.onFocus}
        placeholder={props.placeholder}
        style={props.style}
        value={props.value} 
      />
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
    },
    makeStyles: () => () => ({
      labelContainer: 'label-container',
      eraserIcon: 'eraser-icon',
    }),
    webLightTheme: {},
  };
});

vi.mock('@fluentui/react-icons', () => ({
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

describe('InputTextArea', () => {
  it('renders with label and value', () => {
    render(<FuiInputTextArea label="Test Label" onChange={() => {}} value="Initial Value" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Value')).toBeInTheDocument();
  });

  it('renders required asterisk when required is true', () => {
    render(<FuiInputTextArea label="Required Label" onChange={() => {}} required value={null} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<FuiInputTextArea label="Test" onChange={handleChange} value={null} />);

    const textarea = screen.getByTestId('fluent-textarea');
    fireEvent.change(textarea, { target: { value: 'New Value' } });

    expect(handleChange).toHaveBeenCalledWith('New Value');
  });

  it('displays character count when maxLength is provided', () => {
    const { rerender } = render(
      <FuiInputTextArea label="Test" maxLength={100} onChange={() => {}} value="Hello" />,
    );
    expect(screen.getByText('5/100')).toBeInTheDocument();

    rerender(<FuiInputTextArea label="Test" maxLength={100} onChange={() => {}} value={null} />);
    expect(screen.getByText('0/100')).toBeInTheDocument();

    rerender(<FuiInputTextArea label="Test" maxLength={50} onChange={() => {}} value="A long text" />);
    expect(screen.getByText('11/50')).toBeInTheDocument();
  });

  it('renders eraser icon and clears value when provided', () => {
    const handleChange = vi.fn();
    render(<FuiInputTextArea label="Test" onChange={handleChange} value="Some text" />);

    const eraser = screen.getByTestId('eraser-icon');
    expect(eraser).toBeInTheDocument();

    fireEvent.click(eraser);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('supports className and style', () => {
    const customStyle = { color: 'green' };
    render(
      <FuiInputTextArea
        className="custom-textarea-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
        value={null}
      />,
    );
    const textarea = screen.getByTestId('fluent-textarea');
    expect(textarea).toHaveClass('custom-textarea-class');
    expect(textarea).toHaveStyle('color: rgb(0, 128, 0)');
  });
});
