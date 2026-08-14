import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiToggle } from './fui-toggle';

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  return {
    ToggleButton: ({
      children,
      checked,
      defaultChecked,
      appearance,
      size,
      icon,
      iconPosition,
      className,
      style,
      onClick,
      ...rest
    }: any) => (
      <button
        {...rest}
        aria-pressed={checked ?? defaultChecked}
        className={className}
        data-appearance={appearance}
        data-size={size}
        data-testid="fluent-toggle-button"
        onClick={onClick}
        style={style}
        type="button"
      >
        {icon && iconPosition !== 'after' && <span data-testid="icon-before">{icon}</span>}
        {children}
        {icon && iconPosition === 'after' && <span data-testid="icon-after">{icon}</span>}
      </button>
    ),
  };
});

describe('FuiToggle', () => {
  it('renders the label', () => {
    render(<FuiToggle>Filter</FuiToggle>);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('reflects the controlled checked state', () => {
    render(<FuiToggle checked>Filter</FuiToggle>);
    expect(screen.getByTestId('fluent-toggle-button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects the uncontrolled defaultChecked state', () => {
    render(<FuiToggle defaultChecked>Filter</FuiToggle>);
    expect(screen.getByTestId('fluent-toggle-button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('defaults to unchecked', () => {
    render(<FuiToggle>Filter</FuiToggle>);
    expect(screen.getByTestId('fluent-toggle-button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('fires onClick so the caller can flip its own checked state', () => {
    const handleClick = vi.fn();
    render(
      <FuiToggle checked={false} onClick={handleClick}>
        Filter
      </FuiToggle>,
    );

    fireEvent.click(screen.getByTestId('fluent-toggle-button'));

    expect(handleClick).toHaveBeenCalled();
  });

  it('renders an icon before the label by default', () => {
    render(<FuiToggle icon={<span>★</span>}>Filter</FuiToggle>);
    expect(screen.getByTestId('icon-before')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-after')).not.toBeInTheDocument();
  });

  it('renders an icon after the label when iconPosition is after', () => {
    render(
      <FuiToggle icon={<span>★</span>} iconPosition="after">
        Filter
      </FuiToggle>,
    );
    expect(screen.getByTestId('icon-after')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-before')).not.toBeInTheDocument();
  });

  it('defaults appearance to secondary and size to medium', () => {
    render(<FuiToggle>Filter</FuiToggle>);
    const el = screen.getByTestId('fluent-toggle-button');
    expect(el).toHaveAttribute('data-appearance', 'secondary');
    expect(el).toHaveAttribute('data-size', 'medium');
  });

  it('supports a custom appearance and size', () => {
    render(
      <FuiToggle appearance="primary" size="large">
        Filter
      </FuiToggle>,
    );
    const el = screen.getByTestId('fluent-toggle-button');
    expect(el).toHaveAttribute('data-appearance', 'primary');
    expect(el).toHaveAttribute('data-size', 'large');
  });

  it('supports className and style', () => {
    render(
      <FuiToggle className="custom-toggle-class" style={{ color: 'brown' }}>
        Filter
      </FuiToggle>,
    );
    const el = screen.getByTestId('fluent-toggle-button');
    expect(el).toHaveClass('custom-toggle-class');
    expect(el).toHaveStyle('color: rgb(165, 42, 42)');
  });
});
