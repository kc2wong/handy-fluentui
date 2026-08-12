import { Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';

const POSITION_MAP: Record<
  'top' | 'bottom' | 'left' | 'right',
  'above' | 'below' | 'before' | 'after'
> = {
  top: 'above',
  bottom: 'below',
  left: 'before',
  right: 'after',
};

/** An element exposing a disabled state, either natively (disabled) or via ARIA (aria-disabled). */
type DisableableElement = React.ReactElement<{
  disabled?: boolean;
  'aria-disabled'?: boolean | 'true' | 'false';
}>;

/** Props for FuiTooltip. */
type FuiTooltipProps = {
  /** Text shown in the tooltip/popover. */
  text: string;
  /** Whether the message shows on hover or on click of the wrapped content. Defaults to 'hover'. */
  showOn?: 'hover' | 'click';
  /**
   * When showOn is 'click', milliseconds of inactivity before the message auto-dismisses even if
   * the user never clicks elsewhere. Defaults to 2000.
   */
  dismissMs?: number;
  /** Which side of the wrapped content the message appears on. Defaults to the underlying component's own placement. */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** A single element. When it is disabled, no hover/click affordance is added and the message never shows. */
  children: DisableableElement;
};

/**
 * Wraps arbitrary content with a small message shown on hover (a Tooltip) or on click (a Popover,
 * since Tooltip has no click-triggered mode — dismisses on outside click/Escape instead of blur).
 * If the wrapped element is itself disabled (disabled or aria-disabled), it's rendered as-is.
 */
const FuiTooltip: React.FC<FuiTooltipProps> = ({
  text,
  showOn = 'hover',
  dismissMs = 2000,
  position,
  children,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (showOn !== 'click' || !open) {
      return;
    }
    const id = window.setTimeout(() => setOpen(false), dismissMs);
    return () => window.clearTimeout(id);
  }, [showOn, open, dismissMs]);

  const isDisabled =
    children.props.disabled === true ||
    children.props['aria-disabled'] === true ||
    children.props['aria-disabled'] === 'true';

  if (isDisabled) {
    return children;
  }

  const positioning = position ? POSITION_MAP[position] : undefined;

  if (showOn === 'click') {
    return (
      <Popover onOpenChange={(_, data) => setOpen(data.open)} open={open} positioning={positioning}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverSurface>{text}</PopoverSurface>
      </Popover>
    );
  }

  return (
    <Tooltip content={text} positioning={positioning} relationship="label">
      {children}
    </Tooltip>
  );
};

export { FuiTooltip };
export type { FuiTooltipProps };
