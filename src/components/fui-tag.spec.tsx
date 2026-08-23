import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { FuiTag } from './fui-tag';

vi.mock('@fluentui/react-components', () => ({
  Tag: ({ children, className, onClick, dismissible, dismissIcon }: any) => (
    <span className={className} onClick={onClick}>
      {children}
      {dismissible && dismissIcon && (
        <button aria-label={dismissIcon['aria-label']} onClick={dismissIcon.onClick}>
          {dismissIcon.children}
        </button>
      )}
    </span>
  ),
  makeStyles: () => () => ({ small: 'small', medium: 'medium', large: 'large', clickable: 'clickable' }),
  mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  tokens: {
    spacingVerticalL: '16px',
    spacingVerticalXXL: '24px',
    spacingVerticalXXXL: '32px',
    spacingHorizontalXS: '4px',
    spacingHorizontalSNudge: '6px',
    spacingHorizontalS: '8px',
    spacingHorizontalMNudge: '10px',
    spacingHorizontalM: '12px',
    fontSizeBase100: '10px',
    fontSizeBase200: '12px',
    fontSizeBase300: '14px',
  },
}));

vi.mock('@fluentui/react-icons', () => ({
  DismissRegular: () => <span>X</span>,
}));

describe('FuiTag', () => {
  it('renders the label', () => {
    render(<FuiTag label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('fires onClick when the tag is clicked', () => {
    const onClick = vi.fn();
    render(<FuiTag label="Active" onClick={onClick} />);
    fireEvent.click(screen.getByText('Active'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders a remove button and fires onRemove when clicked, without firing onClick', () => {
    const onRemove = vi.fn();
    render(<FuiTag label="Active" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Active' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not render a remove button when onRemove is not provided', () => {
    render(<FuiTag label="Active" onClick={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(<FuiTag className="custom-class" label="Active" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('defaults to medium size', () => {
    render(<FuiTag label="Active" />);
    expect(screen.getByText('Active')).toHaveClass('medium');
  });

  it('applies small size classes', () => {
    render(<FuiTag label="Active" size="small" />);
    expect(screen.getByText('Active')).toHaveClass('small');
  });

  it('applies large size classes', () => {
    render(<FuiTag label="Active" size="large" />);
    expect(screen.getByText('Active')).toHaveClass('large');
  });

  it('applies the clickable class only when onClick is provided', () => {
    render(<FuiTag label="Active" onClick={vi.fn()} />);
    expect(screen.getByText('Active')).toHaveClass('clickable');
  });

  it('does not apply the clickable class for a plain, non-interactive tag', () => {
    render(<FuiTag label="Active" />);
    expect(screen.getByText('Active')).not.toHaveClass('clickable');
  });
});
