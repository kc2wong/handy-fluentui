import { RadioGroup, RadioGroupProps, RadioGroupOnChangeData } from '@fluentui/react-components';
import React from 'react';

import { withInputField, FieldLayoutProps } from './with-input-field';

// horizontal-stacked is intentionally excluded from layout — not a supported variant here
type BaseInputRadioProps = Omit<RadioGroupProps, 'id' | 'layout' | 'onChange'> & {
  layout?: 'vertical' | 'horizontal';
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
  }
> = (props) => {
  const { onChange, className, style, readOnly = false, ...rest } = props;

  const handleChange: RadioGroupProps['onChange'] = (_ev, data) => {
    if (!readOnly) {
      onChange?.(data);
    }
  };

  return <RadioGroup {...rest} className={className} onChange={handleChange} style={style} />;
};

/** Radio group wrapped with a shared label. horizontal-stacked layout is not supported. */
const InputRadio = withInputField(RawInputRadio);

export { InputRadio as FuiInputRadio };
export type { InputRadioProps };
