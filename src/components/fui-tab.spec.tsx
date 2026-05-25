import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiTabList, FuiTab } from './fui-tab';

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@fluentui/react-components', () => {
  return {
    TabList: ({ children, vertical, onTabSelect, selectedValue }: any) => (
      <div
        data-selected-value={selectedValue}
        data-testid="fluent-tablist"
        data-vertical={String(vertical)}
      >
        {React.Children.map(children, (child: any) =>
          React.cloneElement(child, {
            onClick: () => onTabSelect?.({}, { value: child.props.value }),
          }),
        )}
      </div>
    ),
    Tab: ({ children, icon, value, onClick }: any) => (
      <div data-testid={`fluent-tab-${value}`} onClick={onClick}>
        {icon && <span data-testid="tab-icon">{icon}</span>}
        {children && <span data-testid="tab-label">{children}</span>}
      </div>
    ),
    makeStyles: () => () => ({
      scrollWrapper: 'scroll-wrapper',
      content: 'tab-content',
      tabTextSelected: 'tab-text-selected',
    }),
    tokens: {
      colorNeutralStroke2: 'mock-stroke-color',
      spacingVerticalM: '12px',
      spacingHorizontalM: '12px',
      colorBrandForeground1: 'brand-color',
    },
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  };
});

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('FuiTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile.mockReturnValue(false);
  });

  it('renders headers and selected content correctly in desktop', () => {
    render(
      <FuiTabList<string> selectedValue="Home">
        <FuiTab name="Home">Home Content</FuiTab>
        <FuiTab name="Settings">Settings Content</FuiTab>
      </FuiTabList>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Home Content')).toBeInTheDocument();
    expect(screen.queryByText('Settings Content')).not.toBeInTheDocument();
  });

  it('uses value prop if provided, otherwise defaults to name', () => {
    render(
      <FuiTabList<string> selectedValue="home-key">
        <FuiTab name="Home" value="home-key">Home Content</FuiTab>
      </FuiTabList>
    );

    expect(screen.getByTestId('fluent-tab-home-key')).toBeInTheDocument();
    expect(screen.getByText('Home Content')).toBeInTheDocument();
  });

  it('handles mobile view orientation and scroll wrapper', () => {
    mockIsMobile.mockReturnValue(true);
    render(
      <FuiTabList<string> selectedValue="Home" vertical>
        <FuiTab name="Home">Content</FuiTab>
      </FuiTabList>
    );

    const tabList = screen.getByTestId('fluent-tablist');
    // vertical should be false in mobile
    expect(tabList).toHaveAttribute('data-vertical', 'false');
    
    // Parent should be scroll wrapper
    expect(tabList.parentElement).toHaveClass('scroll-wrapper');
  });

  it('renders icons if provided', () => {
    render(
      <FuiTabList<string> selectedValue="Home">
        <FuiTab icon={<span data-testid="home-icon" />} name="Home">Content</FuiTab>
      </FuiTabList>
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('calls onTabSelect without the event argument when a tab is clicked', () => {
    const onTabSelect = vi.fn();
    render(
      <FuiTabList<string> onTabSelect={onTabSelect} selectedValue="Home">
        <FuiTab name="Home">Home Content</FuiTab>
        <FuiTab name="Settings">Settings Content</FuiTab>
      </FuiTabList>
    );

    fireEvent.click(screen.getByTestId('fluent-tab-Settings'));
    
    expect(onTabSelect).toHaveBeenCalledTimes(1);
    // Should be called with ONLY the data object
    expect(onTabSelect).toHaveBeenCalledWith({ value: 'Settings' });
  });

  it('applies vertical orientation in desktop when vertical prop is true', () => {
    render(
      <FuiTabList<string> selectedValue="Home" vertical>
        <FuiTab name="Home">Content</FuiTab>
      </FuiTabList>
    );

    const tabList = screen.getByTestId('fluent-tablist');
    expect(tabList).toHaveAttribute('data-vertical', 'true');
  });

  it('applies tabTextSelected class to the selected tab label', () => {
    render(
      <FuiTabList<string> selectedValue="Home">
        <FuiTab name="Home">Home Content</FuiTab>
      </FuiTabList>
    );

    const label = screen.getByText('Home');
    expect(label).toHaveClass('tab-text-selected');
  });

  it('filters out children that are not FuiTab', () => {
    render(
      <FuiTabList<string> selectedValue="Home">
        <FuiTab name="Home">Home Content</FuiTab>
        <div data-testid="invalid-child">Invalid</div>
      </FuiTabList>
    );

    expect(screen.queryByTestId('invalid-child')).not.toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
