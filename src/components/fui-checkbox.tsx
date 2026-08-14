import { Checkbox } from '@fluentui/react-components';
import React from 'react';

// Define a pure, independent prop type without any Fluent UI imports
type CheckboxOnChangeData = boolean;

interface FuiCheckboxProps {
  /** Indicates if the checkbox is checked */
  checked?: CheckboxOnChangeData;
  /** Text label rendered next to the checkbox */
  label: string;
  disabled?: boolean;
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
  onChange: (data: CheckboxOnChangeData) => void;
  /** Custom CSS class for the checkbox root. */
  className?: string;
  /** Custom CSS styles for the checkbox root. */
  style?: React.CSSProperties;
}

/** Checkbox with optional read-only mode that visually appears interactive but ignores changes. */
const FuiCheckbox: React.FC<FuiCheckboxProps> = (props) => {
  const { checked = false, label, disabled = false, readOnly = false, onChange, className, style } = props;

  return (
    <Checkbox
      checked={checked}
      className={className}
      disabled={disabled}
      label={label}
      onChange={(_ev, data) => {
        if (!readOnly) {
          onChange(!!data.checked);
        }
      }}
      style={style}
    />
  );
};

export { FuiCheckbox };
export type { FuiCheckboxProps };
