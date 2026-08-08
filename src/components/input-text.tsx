import { Button, Input, InputProps } from '@fluentui/react-components';
import { EyeRegular, EyeOffRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { withInputField, FieldLayoutProps } from './with-input-field';

type BaseInputTextProps = Omit<
  InputProps,
  'defaultValue' | 'type' | 'id' | 'value' | 'onChange'
> & {
  value: string | null;
  onChange: (value: string | null) => void;
  type?: 'text' | 'email' | 'password';
  /** Custom CSS class for the input root. */
  className?: string;
  /** Custom CSS styles for the input root. */
  style?: React.CSSProperties;
};

const RawInputText: React.FC<
  BaseInputTextProps & {
    id?: string;
  }
> = (props) => {
  const {
    type = 'text',
    onChange,
    onKeyDown,
    className,
    style,
    ...rest
  } = props;
  const [showPassword, setShowPassword] = useState(false);

  // If type is email, block typing '@' if already present
  const handleKeyDown =
    type === 'email'
      ? (ev: React.KeyboardEvent<HTMLInputElement>) => {
          if (ev.key === '@' && props.value?.includes('@')) {
            ev.preventDefault();
          }
          onKeyDown?.(ev);
        }
      : onKeyDown;

  const handleChange = (value: string | null | undefined) => {
    onChange(value ?? null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <Input
      {...rest}
      className={className}
      contentAfter={
        type === 'password' ? (
          <Button
            appearance="subtle"
            icon={showPassword ? <EyeOffRegular /> : <EyeRegular />}
            onClick={togglePasswordVisibility}
            size="small"
            type="button"
          />
        ) : rest.contentAfter
      }
      onChange={(_ev, data) => handleChange(data.value)}
      onKeyDown={handleKeyDown}
      style={style}
      type={inputType}
      value={props.value ?? ''}
    />
  );
};

const EnhancedInputText = withInputField(RawInputText);

/** Props for FuiInputText. */
type InputTextProps = BaseInputTextProps & FieldLayoutProps;
/** Text input. password type adds a show/hide toggle; email type blocks a second '@' character. */
const InputText: React.FC<InputTextProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear = value !== null && value !== '' ? () => onChange(null) : undefined;

  return <EnhancedInputText {...rest} onChange={onChange} onClear={onClear} value={value} />;
};

export { InputText as FuiInputText };
export type { InputTextProps };
