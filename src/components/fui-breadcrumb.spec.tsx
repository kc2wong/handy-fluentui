import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FuiBreadcrumb } from './fui-breadcrumb';

vi.mock('@fluentui/react-components', () => ({
  Breadcrumb: ({ children }: any) => <nav data-testid="breadcrumb">{children}</nav>,
  BreadcrumbItem: ({ children }: any) => <li data-testid="breadcrumb-item">{children}</li>,
  BreadcrumbButton: ({
    children,
    className,
    current,
    disabled,
    icon,
    onClick,
    style,
    'aria-disabled': ariaDisabled,
    'aria-label': ariaLabel,
  }: any) => (
    <button
      aria-disabled={ariaDisabled}
      aria-label={ariaLabel}
      className={className}
      data-current={current}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {icon}
      {children}
    </button>
  ),
  BreadcrumbDivider: () => <span data-testid="breadcrumb-divider" />,
  makeStyles: () => () => ({
    nonInteractiveItem: 'non-interactive-item',
    currentItem: 'current-item',
  }),
  mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  tokens: {
    colorNeutralForeground2: 'grey',
    fontSizeBase400: '16px',
  },
}));

vi.mock('@fluentui/react-icons', () => ({
  MoreHorizontalRegular: () => <span data-testid="more-icon" />,
}));

const mockUseBreadcrumb = vi.fn();
vi.mock('@hook/use-breadcrumb', () => ({
  useBreadcrumb: () => mockUseBreadcrumb(),
}));

describe('FuiBreadcrumb', () => {
  it('renders nothing when the trail is empty', () => {
    mockUseBreadcrumb.mockReturnValue({ items: [], isCollapsed: false, toggleCollapsed: vi.fn() });

    render(<FuiBreadcrumb />);

    expect(screen.queryByTestId('breadcrumb-item')).not.toBeInTheDocument();
  });

  it('renders a button per item with its label', () => {
    mockUseBreadcrumb.mockReturnValue({
      items: [{ label: () => 'Home', tag: 'home' }],
      isCollapsed: false,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('marks the last item as current, and disables it when there are fewer than 3 items', () => {
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: false,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    const detailButton = screen.getByText('Detail');
    expect(detailButton).toHaveAttribute('data-current', 'true');
    expect(detailButton).toBeDisabled();
    expect(detailButton).toHaveClass('current-item');
    expect(detailButton).not.toHaveStyle({ cursor: 'pointer' });
  });

  it('does not disable the last item once there are 3 or more items, and toggles collapsed on click', () => {
    const toggleCollapsed = vi.fn();
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Mid', tag: 'mid', action: () => {} },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: false,
      toggleCollapsed,
    });

    render(<FuiBreadcrumb />);

    const detailButton = screen.getByText('Detail');
    expect(detailButton).not.toBeDisabled();
    // BreadcrumbButton forces aria-disabled: true whenever current is set unless explicitly
    // overridden — this must be passed explicitly or the real component ignores clicks.
    expect(detailButton).toHaveAttribute('aria-disabled', 'false');
    // BreadcrumbButton's own "current" styles force cursor: auto on hover — must be overridden
    // inline to show a pointer when the item is actually clickable.
    expect(detailButton).toHaveStyle({ cursor: 'pointer' });

    detailButton.click();

    expect(toggleCollapsed).toHaveBeenCalledTimes(1);
  });

  it('marks a non-last item without an action as non-interactive and disabled', () => {
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: false,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    const homeButton = screen.getByText('Home');
    expect(homeButton).toHaveClass('non-interactive-item');
    expect(homeButton).toBeDisabled();
  });

  it('does not mark a non-last item with an action as non-interactive, and fires the action on click', () => {
    const handleAction = vi.fn();
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home', action: handleAction },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: false,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    const homeButton = screen.getByText('Home');
    expect(homeButton).not.toHaveClass('non-interactive-item');

    homeButton.click();

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders a divider between items but not after the last one', () => {
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: false,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    expect(screen.getAllByTestId('breadcrumb-divider')).toHaveLength(1);
  });

  it('renders the full trail when isCollapsed is true but there are fewer than 3 items', () => {
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: true,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByTestId('more-icon')).not.toBeInTheDocument();
  });

  it('renders only first > … > last when collapsed with 3 or more items', () => {
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Mid', tag: 'mid', action: () => {} },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: true,
      toggleCollapsed: vi.fn(),
    });

    render(<FuiBreadcrumb />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.queryByText('Mid')).not.toBeInTheDocument();
    expect(screen.getByTestId('more-icon')).toBeInTheDocument();
  });

  it('toggles collapsed when the ellipsis is clicked', () => {
    const toggleCollapsed = vi.fn();
    mockUseBreadcrumb.mockReturnValue({
      items: [
        { label: () => 'Home', tag: 'home' },
        { label: () => 'Mid', tag: 'mid', action: () => {} },
        { label: () => 'Detail', tag: 'detail', action: () => {} },
      ],
      isCollapsed: true,
      toggleCollapsed,
    });

    render(<FuiBreadcrumb />);

    screen.getByLabelText('Expand breadcrumb').click();

    expect(toggleCollapsed).toHaveBeenCalledTimes(1);
  });
});
