import { Button } from '@fluentui/react-components';
import React from 'react';

// Define a pure, independent prop type without any Fluent UI imports
type FuiButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  /** Button appearance style. Defaults to 'secondary'. */
  appearance?: 'primary' | 'outline' | 'subtle' | 'transparent' | 'secondary';
  /** Button size scale. Defaults to 'medium'. */
  size?: 'small' | 'medium' | 'large';
  /** Icon rendered alongside the button label. */
  icon?: React.ReactElement;
  /** Side of the label the icon is rendered on. Defaults to 'before'. */
  iconPosition?: 'before' | 'after';
  /** React children nodes */
  children?: React.ReactNode;
};

const FuiButton: React.FC<FuiButtonProps> = ({
  children,
  appearance = 'secondary',
  size = 'medium',
  icon,
  iconPosition = 'before',
  ...rest
}) => {
  return (
    <Button appearance={appearance} icon={icon} iconPosition={iconPosition} size={size} {...rest}>
      {children}
    </Button>
  );
};

/** Props for FuiIconButton. */
type FuiIconButtonProps = Omit<FuiButtonProps, 'children' | 'icon' | 'iconPosition'> & {
  /** Icon rendered inside the button. FuiIconButton always renders icon-only. */
  icon: React.ReactElement;
  /** Accessible name. Required since the button has no visible label. */
  'aria-label': string;
};

/** A square, icon-only button. Thin wrapper around FuiButton with no children, so it always renders in FluentUI Button's icon-only mode. Defaults to a subtle appearance, matching common toolbar/close-button usage. */
const FuiIconButton: React.FC<FuiIconButtonProps> = ({ appearance = 'subtle', icon, ...rest }) => {
  return <FuiButton appearance={appearance} icon={icon} {...rest} />;
};

export { FuiButton, FuiIconButton };
export type { FuiButtonProps, FuiIconButtonProps };
