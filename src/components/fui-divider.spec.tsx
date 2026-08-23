import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FuiDivider } from './fui-divider';

vi.mock('@fluentui/react-components', () => ({
  Divider: ({ children, className, vertical }: any) => (
    <div className={className} data-orientation={vertical ? 'vertical' : 'horizontal'} data-testid="divider">
      {children}
    </div>
  ),
}));

describe('FuiDivider', () => {
  it('defaults to a horizontal divider when vertical is omitted', () => {
    render(<FuiDivider />);
    expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders a vertical divider when vertical is true', () => {
    render(<FuiDivider vertical />);
    expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders children as a label', () => {
    render(<FuiDivider>Section</FuiDivider>);
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('ignores vertical when children are given', () => {
    render(<FuiDivider vertical>Section</FuiDivider>);
    expect(screen.getByTestId('divider')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('applies a custom className', () => {
    const { container } = render(<FuiDivider className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
