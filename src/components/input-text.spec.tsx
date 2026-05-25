import { fireEvent, render, screen, createEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiInputText } from './input-text';

vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => false,
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
          type={props.type}
          value={props.value} 
        />
        {props.contentAfter && <div data-testid="content-after">{props.contentAfter}</div>}
      </div>
    ),
    Button: (props: any) => (
      <button 
        data-testid="fluent-button" 
        onClick={props.onClick}
        type={props.type || 'button'}
      >
        {props.icon}
        {props.children}
      </button>
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
  EyeRegular: () => <span data-testid="eye-icon" />,
  EyeOffRegular: () => <span data-testid="eye-off-icon" />,
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

describe('InputText', () => {
  it('renders with label and value', () => {
    render(<FuiInputText label="Test Label" onChange={() => {}} value="Initial Value" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Value')).toBeInTheDocument();
  });

  it('renders required asterisk when required is true', () => {
    render(<FuiInputText label="Required Label" onChange={() => {}} required value={null} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<FuiInputText label="Test" onChange={handleChange} value={null} />);

    const input = screen.getByTestId('fluent-input');
    fireEvent.change(input, { target: { value: 'New Value' } });

    expect(handleChange).toHaveBeenCalledWith('New Value');
  });

  it('renders eraser icon and clears value when provided', () => {
    const handleChange = vi.fn();
    render(<FuiInputText label="Test" onChange={handleChange} value="Some text" />);

    const eraser = screen.getByTestId('eraser-icon');
    expect(eraser).toBeInTheDocument();

    fireEvent.click(eraser);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('sets the input type correctly', () => {
    const { rerender } = render(<FuiInputText label="Default" onChange={() => {}} value={null} />);
    expect(screen.getByTestId('fluent-input')).toHaveAttribute('type', 'text');

    rerender(<FuiInputText label="Password" onChange={() => {}} type="password" value={null} />);
    expect(screen.getByTestId('fluent-input')).toHaveAttribute('type', 'password');

    rerender(<FuiInputText label="Email" onChange={() => {}} type="email" value={null} />);
    expect(screen.getByTestId('fluent-input')).toHaveAttribute('type', 'email');
  });

  it('prevents typing multiple @ in email type', () => {
    render(<FuiInputText label="Email" onChange={() => {}} type="email" value="user@" />);
    const input = screen.getByTestId('fluent-input');

    const keyDownEvent = createEvent.keyDown(input, { key: '@' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(true);
  });

  it('allows typing @ in email type if none present', () => {
    render(<FuiInputText label="Email" onChange={() => {}} type="email" value="user" />);
    const input = screen.getByTestId('fluent-input');

    const keyDownEvent = createEvent.keyDown(input, { key: '@' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(false);
  });

  it('allows other keys in email type', () => {
    render(<FuiInputText label="Email" onChange={() => {}} type="email" value="user@" />);
    const input = screen.getByTestId('fluent-input');

    const keyDownEvent = createEvent.keyDown(input, { key: 'a' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(false);
  });

  it('toggles password visibility', () => {
    render(<FuiInputText label="Password" onChange={() => {}} type="password" value="secret" />);
    const input = screen.getByTestId('fluent-input');
    const button = screen.getByTestId('fluent-button');

    // Initially type should be password and eye icon shown
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

    // Click to show password
    fireEvent.click(button);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

    // Click to hide password
    fireEvent.click(button);
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });

  it('supports className and style', () => {
    const customStyle = { color: 'red' };
    render(
      <FuiInputText
        className="custom-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
        value={null}
      />,
    );
    const input = screen.getByTestId('fluent-input');
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveStyle('color: rgb(255, 0, 0)');
  });
});
