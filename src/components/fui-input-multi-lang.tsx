import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import { DismissRegular, TranslateRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { FuiIconButton } from './fui-button';
import { FuiDrawer, FuiDrawerHeader, FuiDrawerBody } from './fui-drawer';
import { FuiInputText, FuiInputTextProps } from './fui-input-text';
import { withInputField, FieldLayoutProps } from './with-input-field';

/** Holds text in up to three languages, mapped positionally to the slots in SupportedLanguage. Null means the slot is unpopulated. */
type MultiLangText = {
  /** Value for the first configured language. */
  valueInLangOne: string | null;
  /** Value for the second configured language. */
  valueInLangTwo: string | null;
  /** Value for the third configured language. */
  valueInLangThree: string | null;
};

type BaseInputMultiLangTextProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'id' | 'onChange' | 'type' | 'value' | 'children'
> & {
  value: MultiLangText | null;
  onChange: (value: MultiLangText | null) => void;
  label: string; // Must provide a label
  /** Language slot names shown in the drawer (up to 3). When fewer than 2 are provided the translate icon is hidden. */
  langLabel?: { languages: string[] };
  /** Custom CSS class for the input root. */
  className?: string;
  /** Custom CSS styles for the input root. */
  style?: React.CSSProperties;
  /** Component used to render each per-language field in the drawer. Must accept FuiInputTextProps. Defaults to FuiInputText. */
  textComponent?: React.ComponentType<FuiInputTextProps>;
};

const useStyles = makeStyles({
  drawerBase: {
    height: 'auto',
  },
  drawerMobile: {
    height: '40vh',
    maxHeight: '60vh',
  },
  drawerDesktop: {
    width: '40vw',
    maxWidth: '60vw',
    maxHeight: '100vh',
  },
  drawerHeader: {
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
});

const RawInputMultiLangText: React.FC<
  BaseInputMultiLangTextProps & {
    id?: string;
    drawerTitle: string;
  }
> = (props) => {
  const {
    value,
    onChange,
    disabled,
    drawerTitle,
    className,
    readOnly,
    style,
    langLabel,
    textComponent: TextComponent = FuiInputText,
    ...rest
  } = props;
  const isMobile = useIsMobile();

  const languages = (langLabel?.languages ?? []).slice(0, 3);
  const styles = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayValue = value
    ? (value.valueInLangOne ?? value.valueInLangTwo ?? value.valueInLangThree ?? '')
    : '';

  const handleChange = (newVal: string | null) => {
    if (!value) {
      onChange({
        valueInLangOne: newVal || null,
        valueInLangTwo: null,
        valueInLangThree: null,
      });
      return;
    }

    if (value.valueInLangOne !== null) {
      onChange({ ...value, valueInLangOne: newVal || null });
    } else if (value.valueInLangTwo !== null) {
      onChange({ ...value, valueInLangTwo: newVal || null });
    } else if (value.valueInLangThree !== null) {
      onChange({ ...value, valueInLangThree: newVal || null });
    } else {
      onChange({ ...value, valueInLangOne: newVal || null });
    }
  };

  const handleFieldChange = (field: keyof MultiLangText, newVal: string | null) => {
    const updatedValue: MultiLangText = {
      valueInLangOne: value?.valueInLangOne ?? null,
      valueInLangTwo: value?.valueInLangTwo ?? null,
      valueInLangThree: value?.valueInLangThree ?? null,
      [field]: newVal,
    };
    onChange(updatedValue);
  };

  const drawerToggle = (
    <TranslateRegular onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }} />
  );
  const drawer = (
    <FuiDrawer
      className={mergeClasses(
        styles.drawerBase,
        isMobile ? styles.drawerMobile : styles.drawerDesktop
      )}
      onOpenChange={setIsDrawerOpen}
      open={isDrawerOpen}
      position="end"
    >
      <FuiDrawerHeader
        action={
          <FuiIconButton
            aria-label="Close"
            icon={<DismissRegular />}
            onClick={() => setIsDrawerOpen(false)}
          />
        }
        className={styles.drawerHeader}
        title={drawerTitle}
      />
      <FuiDrawerBody className={styles.drawerBody}>
        <TextComponent
          disabled={disabled}
          label={languages[0] || 'Lang One'}
          onChange={(val) => handleFieldChange('valueInLangOne', val)}
          readOnly={readOnly}
          value={value?.valueInLangOne ?? null}
        />
        {languages[1] && (
          <TextComponent
            disabled={disabled}
            label={languages[1]}
            onChange={(val) => handleFieldChange('valueInLangTwo', val)}
            readOnly={readOnly}
            value={value?.valueInLangTwo ?? null}
          />
        )}
        {languages[2] && (
          <TextComponent
            disabled={disabled}
            label={languages[2]}
            onChange={(val) => handleFieldChange('valueInLangThree', val)}
            readOnly={readOnly}
            value={value?.valueInLangThree ?? null}
          />
        )}
      </FuiDrawerBody>
    </FuiDrawer>
  );

  return (
    <>
      <TextComponent
        {...rest}
        className={className}
        clearable={false}
        contentAfter={languages.length > 1 ? drawerToggle : undefined}
        disabled={disabled}
        label={null}
        noMessage
        onChange={(val) => handleChange(val)}
        readOnly={readOnly}
        style={style}
        value={displayValue}
      />
      {languages.length > 1 && drawer}
    </>
  );
};

const EnhancedInputMultiLangText = withInputField(RawInputMultiLangText);

/** Props for FuiInputMultiLangText. label is required and doubles as the per-language drawer title. */
type FuiInputMultiLangTextProps = BaseInputMultiLangTextProps & FieldLayoutProps;
/** Text input with per-language values. Translate icon opens a drawer with one input per configured language. */
const FuiInputMultiLangText: React.FC<FuiInputMultiLangTextProps> = (props) => {
  const { value, onChange } = props;
  const hasValue =
    value && (value.valueInLangOne || value.valueInLangTwo || value.valueInLangThree);
  const onClear = hasValue ? () => onChange(null) : undefined;

  return (
    <EnhancedInputMultiLangText
      {...props}
      drawerTitle={props.label ?? props.placeholder ?? ''}
      onClear={onClear}
    />
  );
};

export { FuiInputMultiLangText };
export type { MultiLangText, FuiInputMultiLangTextProps };
