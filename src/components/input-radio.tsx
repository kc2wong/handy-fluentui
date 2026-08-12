import { RadioGroup, RadioGroupProps, RadioGroupOnChangeData } from '@fluentui/react-components';
import React from 'react';

import { withInputField, FieldLayoutProps } from './with-input-field';

// horizontal-stacked is intentionally excluded from layout — not a supported variant here
type RadioListLayout = 'vertical' | 'horizontal';

// `layout` is omitted here because FieldLayoutProps already defines it (for the field's own
// label position); the radio options' own arrangement is deduced from that via radioListLayout
// below instead of being exposed as a second, colliding `layout` prop.
type BaseInputRadioProps = Omit<RadioGroupProps, 'id' | 'layout' | 'onChange'> & {
  onChange?: (data: RadioGroupOnChangeData) => void;
  /** Custom CSS class for the radio group root. */
  className?: string;
  /** Custom CSS styles for the radio group root. */
  style?: React.CSSProperties;
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
};

/** Props for FuiInputRadio. */
type InputRadioProps = BaseInputRadioProps & FieldLayoutProps;

const RawInputRadio: React.FC<
  BaseInputRadioProps & {
    id?: string;
    radioListLayout: RadioListLayout;
  }
> = (props) => {
  const { onChange, className, style, readOnly = false, radioListLayout, ...rest } = props;

  const handleChange: RadioGroupProps['onChange'] = (_ev, data) => {
    if (!readOnly) {
      onChange?.(data);
    }
  };

  return (
    <RadioGroup
      {...rest}
      className={className}
      layout={radioListLayout}
      onChange={handleChange}
      style={style}
    />
  );
};

const EnhancedInputRadio = withInputField(RawInputRadio);

/** Radio group wrapped with a shared label. horizontal-stacked layout is not supported. */
const InputRadio: React.FC<InputRadioProps> = (props) => {
  const { layout = 'vertical', labelWidth = 'quarter', ...rest } = props as any;

  return layout === 'vertical' ? (
    // no labelWidth for vertical
    <EnhancedInputRadio {...rest} layout="vertical" radioListLayout="horizontal" />
  ) : (
    <EnhancedInputRadio
      {...rest}
      labelWidth={labelWidth}
      layout="horizontal"
      radioListLayout="vertical"
    />
  );
};

export { InputRadio as FuiInputRadio };
export type { InputRadioProps };
