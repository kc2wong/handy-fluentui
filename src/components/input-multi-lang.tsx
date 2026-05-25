import {
  Button,
  InputProps,
  OverlayDrawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  makeStyles,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import { DismissRegular, TranslateRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { FuiInputText, InputTextProps } from './input-text';
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
  InputProps,
  'defaultValue' | 'type' | 'id' | 'value' | 'onChange' | 'label'
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
  /** Component used to render each per-language field in the drawer. Must accept InputTextProps. Defaults to FuiInputText. */
  textComponent?: React.ComponentType<InputTextProps>;
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
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
    overflowY: 'auto',
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
    <OverlayDrawer
      className={mergeClasses(
        styles.drawerBase,
        isMobile ? styles.drawerMobile : styles.drawerDesktop,
      )}
      onOpenChange={(_, { open }) => setIsDrawerOpen(open)}
      open={isDrawerOpen}
      position={isMobile ? 'bottom' : 'end'}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<DismissRegular />}
              onClick={() => setIsDrawerOpen(false)}
            />
          }
        >
          {drawerTitle}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.drawerBody}>
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
      </DrawerBody>
    </OverlayDrawer>
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
        onChange={(value) => handleChange(value)}
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
type InputMultiLangTextProps = BaseInputMultiLangTextProps & FieldLayoutProps;
/** Text input with per-language values. Translate icon opens a drawer with one input per configured language. */
const InputMultiLangText: React.FC<InputMultiLangTextProps> = (props) => {
  const { value, onChange } = props;
  const hasValue =
    value && (value.valueInLangOne || value.valueInLangTwo || value.valueInLangThree);
  const onClear = hasValue ? () => onChange(null) : undefined;

  return <EnhancedInputMultiLangText {...props} drawerTitle={props.label ?? props.placeholder} onClear={onClear} />;
};

export { InputMultiLangText as FuiInputMultiLangText };
export type { MultiLangText, InputMultiLangTextProps };
