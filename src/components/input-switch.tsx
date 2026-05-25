import { Switch, SwitchProps } from '@fluentui/react-components';
import React from 'react';

/** Props for FuiInputSwitch. onChange receives the new boolean directly instead of the raw SwitchProps event. */
type InputSwitchProps = Omit<SwitchProps, 'onChange'> & {
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
  onChange: (value: boolean) => void;
  /** Custom CSS class for the switch root. */
  className?: string;
  /** Custom CSS styles for the switch root. */
  style?: React.CSSProperties;
};

/** Toggle switch. readOnly silently ignores changes without any visual indication. */
const InputSwitch: React.FC<InputSwitchProps> = (props) => {
  const { readOnly = false, onChange, className, style, ...rest } = props;

  const handleChange: SwitchProps['onChange'] = (_ev, data) => {
    if (!readOnly) {
      onChange(data.checked);
    }
  };

  return <Switch {...rest} className={className} onChange={handleChange} style={style} />;
};

export { InputSwitch as FuiInputSwitch };
export type { InputSwitchProps };
