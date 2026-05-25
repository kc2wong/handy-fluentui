import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiInputSwitch } from './input-switch';

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  return {
    FluentProvider: ({ children }: any) => <div>{children}</div>,
    Switch: (props: any) => (
      <label className={props.className} data-testid="fluent-switch-wrapper" style={props.style}>
        <input 
          checked={props.checked} 
          data-testid="fluent-switch"
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
  };
});

describe('InputSwitch', () => {
  it('renders correctly', () => {
    render(<FuiInputSwitch label="Enable Notifications" onChange={() => {}}/>);
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-switch')).toBeInTheDocument();
  });

  it('calls onChange when not readOnly', () => {
    const handleChange = vi.fn();
    render(<FuiInputSwitch label="Test" onChange={handleChange} />);
    
    const switchElement = screen.getByTestId('fluent-switch');
    fireEvent.click(switchElement);
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('does not call onChange when readOnly is true', () => {
    const handleChange = vi.fn();
    render(<FuiInputSwitch label="Test" onChange={handleChange} readOnly={true} />);
    
    const switchElement = screen.getByTestId('fluent-switch');
    fireEvent.click(switchElement);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports className and style', () => {
    const customStyle = { color: 'brown' };
    render(
      <FuiInputSwitch
        className="custom-switch-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
      />,
    );
    const switchWrapper = screen.getByTestId('fluent-switch-wrapper');
    expect(switchWrapper).toHaveClass('custom-switch-class');
    expect(switchWrapper).toHaveStyle('color: rgb(165, 42, 42)');
  });
});
