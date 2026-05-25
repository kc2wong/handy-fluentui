import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiButtonPanel } from './fui-button-panel';

// Mock Fluent UI to avoid ESM/token issues in tests
vi.mock('@fluentui/react-components', () => {
  return {
    makeStyles: () => () => ({
      root: 'root-class',
      row: 'row-class',
      column: 'column-class',
      left: 'left-class',
      right: 'right-class',
    }),
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: {
      spacingHorizontalM: '12px',
    },
    webLightTheme: {},
  };
});

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

describe('FuiButtonPanel', () => {
  const MockButton = ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  );

  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it('renders children correctly', () => {
    render(
      <FuiButtonPanel>
        <MockButton>Button 1</MockButton>
        <MockButton>Button 2</MockButton>
      </FuiButtonPanel>
    );

    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });

  it('applies right alignment and row layout by default in desktop', () => {
    const { container } = render(
      <FuiButtonPanel>
        <MockButton>Button</MockButton>
      </FuiButtonPanel>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('root-class');
    expect(div).toHaveClass('row-class');
    expect(div).toHaveClass('right-class');
    expect(div).not.toHaveClass('left-class');
    expect(div).not.toHaveClass('column-class');
  });

  it('applies column layout in mobile view', () => {
    mockIsMobile.mockReturnValue(true);
    const { container } = render(
      <FuiButtonPanel>
        <MockButton>Button</MockButton>
      </FuiButtonPanel>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('root-class');
    expect(div).toHaveClass('column-class');
    expect(div).not.toHaveClass('row-class');
  });

  it('applies left alignment when specified', () => {
    const { container } = render(
      <FuiButtonPanel alignItems="left">
        <MockButton>Button</MockButton>
      </FuiButtonPanel>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('root-class');
    expect(div).toHaveClass('left-class');
    expect(div).not.toHaveClass('right-class');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FuiButtonPanel className="custom-class">
        <MockButton>Button</MockButton>
      </FuiButtonPanel>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('custom-class');
  });
});
