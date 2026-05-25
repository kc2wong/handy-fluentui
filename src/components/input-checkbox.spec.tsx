import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiInputCheckbox } from './input-checkbox';

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  return {
    FluentProvider: ({ children }: any) => <div>{children}</div>,
    Checkbox: (props: any) => (
      <label className={props.className} data-testid="fluent-checkbox-wrapper" style={props.style}>
        <input 
          checked={props.checked} 
          data-testid="fluent-checkbox"
          id={props.id}
          onBlur={props.onBlur}
          onChange={(e) => props.onChange?.(e, { checked: e.target.checked })} 
          onFocus={props.onFocus}
          type="checkbox"
        />
        {props.label}
      </label>
    ),
    Label: ({ children, htmlFor, required }: any) => (
      <label htmlFor={htmlFor}>
        {children}
        {required && <span>*</span>}
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
    makeStyles: () => () => ({}),
    webLightTheme: {},
  };
});

describe('InputCheckbox', () => {
  it('renders correctly', () => {
    render(<FuiInputCheckbox label="Accept Terms" />);
    expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-checkbox')).toBeInTheDocument();
  });

  it('calls onChange when not readOnly', () => {
    const handleChange = vi.fn();
    render(<FuiInputCheckbox label="Test" onChange={(data) => handleChange(data)} />);
    
    const checkbox = screen.getByTestId('fluent-checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('does not call onChange when readOnly is true', () => {
    const handleChange = vi.fn();
    render(<FuiInputCheckbox label="Test" onChange={(data) => handleChange(data)} readOnly={true} />);
    
    const checkbox = screen.getByTestId('fluent-checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports className and style', () => {
    const customStyle = { color: 'blue' };
    render(
      <FuiInputCheckbox
        className="custom-checkbox-class"
        label="Test"
        style={customStyle}
      />,
    );
    const checkboxWrapper = screen.getByTestId('fluent-checkbox-wrapper');
    expect(checkboxWrapper).toHaveClass('custom-checkbox-class');
    expect(checkboxWrapper).toHaveStyle('color: rgb(0, 0, 255)');
  });
});
