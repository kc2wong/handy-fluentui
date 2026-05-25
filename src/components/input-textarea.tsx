import { Textarea, TextareaProps } from '@fluentui/react-components';
import React from 'react';

import { withInputField, FieldLayoutProps } from './with-input-field';

type BaseInputTextAreaProps = Omit<TextareaProps, 'defaultValue' | 'id' | 'value' | 'onChange'> & {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Custom CSS class for the textarea root. */
  className?: string;
  /** Custom CSS styles for the textarea root. */
  style?: React.CSSProperties;
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
};

/** Props for FuiInputTextArea. When maxLength is set, a character counter appears in the message area unless additionalMessage is provided. */
type InputTextAreaProps = BaseInputTextAreaProps & FieldLayoutProps;

const RawTextArea: React.FC<BaseInputTextAreaProps & { id?: string }> = (props) => {
  const { value, onChange, className, style, readOnly = false, ...rest } = props;
  return (
    <Textarea
      {...rest}
      className={className}
      onChange={(_e, data) => {
        if (!readOnly) {
          onChange(data.value ?? null);
        }
      }}
      style={style}
      value={value ?? ''}
    />
  );
};

const TextareaWithField = withInputField(RawTextArea);

/** Multi-line text area. Automatically appends a character counter when maxLength is set and no additionalMessage is given. */
const InputTextArea: React.FC<InputTextAreaProps> = (props) => {
  const { value, maxLength, additionalMessage, onChange, ...rest } = props;

  const charCounter = maxLength !== undefined ? `${(value ?? '').length}/${maxLength}` : undefined;
  const onClear = value !== null && value !== '' ? () => onChange(null) : undefined;

  return (
    <TextareaWithField
      {...rest}
      additionalMessage={additionalMessage ?? charCounter}
      maxLength={maxLength}
      onChange={onChange}
      onClear={onClear}
      value={value}
    />
  );
};

export { InputTextArea as FuiInputTextArea };
export type { InputTextAreaProps };
