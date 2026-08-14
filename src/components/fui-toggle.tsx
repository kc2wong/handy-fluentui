import { ToggleButton } from '@fluentui/react-components';
import React from 'react';

// Define a pure, independent prop type without any Fluent UI imports
type FuiToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  /** Whether the toggle is currently pressed. Controlled. */
  checked?: boolean;
  /** Initial pressed state for uncontrolled usage. Defaults to false. */
  defaultChecked?: boolean;
  /** Button appearance style. Defaults to 'secondary'. */
  appearance?: 'primary' | 'outline' | 'subtle' | 'transparent' | 'secondary';
  /** Button size scale. Defaults to 'medium'. */
  size?: 'small' | 'medium' | 'large';
  /** Icon rendered alongside the label. */
  icon?: React.ReactElement;
  /** Side of the label the icon is rendered on. Defaults to 'before'. */
  iconPosition?: 'before' | 'after';
  /** React children nodes */
  children?: React.ReactNode;
};

const FuiToggle: React.FC<FuiToggleProps> = ({
  children,
  checked,
  defaultChecked = false,
  appearance = 'secondary',
  size = 'medium',
  icon,
  iconPosition = 'before',
  ...rest
}) => {
  return (
    <ToggleButton
      appearance={appearance}
      checked={checked}
      defaultChecked={defaultChecked}
      icon={icon}
      iconPosition={iconPosition}
      size={size}
      {...rest}
    >
      {children}
    </ToggleButton>
  );
};

export { FuiToggle };
export type { FuiToggleProps };
