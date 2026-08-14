import { Input } from '@fluentui/react-components';
import { EyeRegular, EyeOffRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { FuiIconButton } from './fui-button';
import { withInputField, FieldLayoutProps } from './with-input-field';

type BaseInputTextProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'type' | 'id' | 'value' | 'onChange' | 'children' | 'size'
> & {
  value: string | null;
  onChange: (value: string | null) => void;
  type?: 'text' | 'email' | 'password';
  /** Content rendered inside the input, left-aligned (e.g. an icon). */
  contentBefore?: React.ReactElement;
  /** Content rendered inside the input, right-aligned (e.g. an icon button). Ignored when type is 'password'. */
  contentAfter?: React.ReactElement;
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
    id,
    type = 'text',
    onChange,
    onKeyDown,
    className,
    style,
    contentBefore,
    contentAfter,
    value,
    ...rest
  } = props;
  const [showPassword, setShowPassword] = useState(false);

  // If type is email, block typing '@' if already present
  const handleKeyDown =
    type === 'email'
      ? (ev: React.KeyboardEvent<HTMLInputElement>) => {
          if (ev.key === '@' && value?.includes('@')) {
            ev.preventDefault();
          }
          onKeyDown?.(ev);
        }
      : onKeyDown;

  const handleChange = (newValue: string | null | undefined) => {
    onChange(newValue ?? null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasValue = (value?.length ?? 0) > 0;

  return (
    <Input
      {...rest}
      className={className}
      contentAfter={
        type === 'password' ? (
          hasValue ? (
            <FuiIconButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              icon={showPassword ? <EyeOffRegular /> : <EyeRegular />}
              onClick={togglePasswordVisibility}
              size="small"
              type="button"
            />
          ) : undefined
        ) : (
          contentAfter
        )
      }
      contentBefore={contentBefore}
      id={id}
      onChange={(_ev, data) => handleChange(data.value)}
      onKeyDown={handleKeyDown}
      style={style}
      type={inputType}
      value={value ?? ''}
    />
  );
};

const EnhancedInputText = withInputField(RawInputText);

/** Props for FuiInputText. */
type FuiInputTextProps = BaseInputTextProps & FieldLayoutProps;
/** Text input. password type adds a show/hide toggle; email type blocks a second '@' character. */
const FuiInputText: React.FC<FuiInputTextProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear = value !== null && value !== '' ? () => onChange(null) : undefined;

  return <EnhancedInputText {...rest} onChange={onChange} onClear={onClear} value={value} />;
};

export { FuiInputText };
export type { FuiInputTextProps };
