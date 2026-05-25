import { Checkbox, CheckboxProps, CheckboxOnChangeData } from '@fluentui/react-components';
import React from 'react';

/** Props for FuiInputCheckbox. */
type InputCheckboxProps = Omit<CheckboxProps, 'onChange'> & {
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
  onChange?: (data: CheckboxOnChangeData) => void;
  /** Custom CSS class for the checkbox root. */
  className?: string;
  /** Custom CSS styles for the checkbox root. */
  style?: React.CSSProperties;
};

/** Checkbox with optional read-only mode that visually appears interactive but ignores changes. */
const InputCheckbox: React.FC<InputCheckboxProps> = (props) => {
  const { readOnly = false, onChange, className, style, ...rest } = props;

  const handleChange: CheckboxProps['onChange'] = (_ev, data) => {
    if (!readOnly) {
      onChange?.(data);
    }
  };

  return <Checkbox {...rest} className={className} onChange={handleChange} style={style} />;
};

export { InputCheckbox as FuiInputCheckbox };
export type { InputCheckboxProps };
