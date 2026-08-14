import { Switch } from '@fluentui/react-components';
import React from 'react';

// Define a pure, independent prop type without any Fluent UI imports
interface FuiSwitchProps {
  /** Indicates if the switch is toggled on */
  checked?: boolean;
  /** Initial value for uncontrolled state */
  defaultChecked?: boolean;
  /** Text displayed next to the switch */
  label: string;
  /** Disables interaction if true */
  disabled?: boolean;
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
  onChange: (value: boolean) => void;
  /** Custom CSS class for the switch root. */
  className?: string;
  /** Custom CSS styles for the switch root. */
  style?: React.CSSProperties;
}

/** Toggle switch. readOnly silently ignores changes without any visual indication. */
const FuiSwitch: React.FC<FuiSwitchProps> = ({
  checked = false,
  defaultChecked,
  label,
  disabled = false,
  onChange,
  className,
  style,
  readOnly = false,
}) => {
  const handleChange = (_ev: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean }) => {
    if (!readOnly) {
      onChange(data.checked);
    }
  };

  return (
    <Switch
      checked={checked}
      className={className}
      defaultChecked={defaultChecked}
      disabled={disabled}
      label={label}
      onChange={handleChange}
      style={style}
    />
  );
};

export { FuiSwitch };
export type { FuiSwitchProps };
