import { Textarea } from '@fluentui/react-components';
import React from 'react';

import { withInputField, FieldLayoutProps } from './with-input-field';

type BaseInputTextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'defaultValue' | 'id' | 'value' | 'onChange'
> & {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Custom CSS class for the textarea root. */
  className?: string;
  /** Custom CSS styles for the textarea root. */
  style?: React.CSSProperties;
};

/** Props for FuiInputTextArea. When maxLength is set, a character counter appears in the message area unless additionalMessage is provided. */
type FuiInputTextAreaProps = BaseInputTextAreaProps & FieldLayoutProps;

const RawTextArea: React.FC<BaseInputTextAreaProps & { id?: string }> = (props) => {
  const { id, value, onChange, className, style, rows = 4, maxLength, ...rest } = props;
  return (
    <Textarea
      {...rest}
      className={className}
      id={id}
      maxLength={maxLength}
      onChange={(_e, data) => {
        onChange(data.value ?? null);
      }}
      rows={rows}
      style={style}
      value={value ?? ''}
    />
  );
};

const TextareaWithField = withInputField(RawTextArea);

/** Multi-line text area. Automatically appends a character counter when maxLength is set and no additionalMessage is given. */
const FuiInputTextArea: React.FC<FuiInputTextAreaProps> = (props) => {
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

export { FuiInputTextArea };
export type { FuiInputTextAreaProps };
