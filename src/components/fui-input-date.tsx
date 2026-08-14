import { Calendar } from '@fluentui/react-calendar-compat';
import { Input, makeStyles, tokens } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { CalendarRegular, DismissRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { FuiIconButton } from './fui-button';
import { FuiDrawer, FuiDrawerHeader, FuiDrawerBody } from './fui-drawer';
import { withInputField, FieldLayoutProps } from './with-input-field';

const useStyles = makeStyles({
  drawer: {
    height: 'auto',
    maxHeight: '80vh',
  },
  drawerHeader: {
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
  calendarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
});

type BaseInputDateProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  /** Custom date formatter. Defaults to Date.toLocaleDateString(). */
  formatter?: (date: Date | null) => string;
  placeholder?: string;
  /** Custom CSS class for the date picker root. */
  className?: string;
  /** Custom CSS styles for the date picker root. */
  style?: React.CSSProperties;
  /** When true, the calendar popup/drawer is suppressed. */
  readOnly?: boolean;
  disabled?: boolean;
};

const defaultFormatter = (date: Date | null) => (date ? date.toLocaleDateString() : '');

const RawInputDate: React.FC<
  BaseInputDateProps & {
    id?: string;
    drawerTitle?: string;
  }
> = (props) => {
  const {
    id,
    value,
    onChange,
    formatter = defaultFormatter,
    placeholder,
    className,
    style,
    readOnly,
    disabled,
  } = props;
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileDate {...props} />;
  }

  if (readOnly) {
    return (
      <Input
        className={className}
        id={id}
        placeholder={placeholder}
        readOnly
        style={{ width: '100%', ...style }}
        type="text"
        value={formatter(value)}
      />
    );
  }

  return (
    <DatePicker
      key={`${id}-${value ? 'defined' : 'undefined'}`}
      className={className}
      disabled={disabled}
      formatDate={(date) => formatter(date ?? null)}
      id={id}
      onSelectDate={(date) => onChange(date ?? null)}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      value={value ?? undefined}
    />
  );
};

const MobileDate: React.FC<
  BaseInputDateProps & {
    id?: string;
    drawerTitle?: string;
  }
> = (props) => {
  const {
    id,
    value,
    onChange,
    formatter = defaultFormatter,
    placeholder,
    className,
    style,
    drawerTitle,
    readOnly,
    disabled,
  } = props;
  const styles = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleInputClick = () => {
    if (!readOnly) {
      setIsDrawerOpen(true);
    }
  };

  const handleDateSelect = (date: Date | null | undefined) => {
    onChange(date ?? null);
    setIsDrawerOpen(false);
  };

  const contentAfter = readOnly ? undefined : (
    <CalendarRegular key={`${id}-calendar`} onClick={handleInputClick} style={{ cursor: 'pointer' }} />
  );

  const formattedDate = formatter(value);

  return (
    <>
      <Input
        autoComplete="off"
        className={className}
        contentAfter={contentAfter}
        disabled={disabled}
        id={id}
        onClick={handleInputClick}
        onKeyDown={(e) => e.preventDefault()}
        placeholder={placeholder}
        readOnly
        style={style}
        type="text"
        value={formattedDate}
      />
      <FuiDrawer
        className={styles.drawer}
        onOpenChange={setIsDrawerOpen}
        open={isDrawerOpen}
        position="bottom"
      >
        {drawerTitle && (
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
        )}
        <FuiDrawerBody>
          <div className={styles.calendarWrapper}>
            <Calendar
              key={`${id}-${value ? 'defined' : 'undefined'}`}
              onSelectDate={handleDateSelect}
              value={value ?? undefined}
            />
          </div>
        </FuiDrawerBody>
      </FuiDrawer>
    </>
  );
};

const EnhancedInputDate = withInputField(RawInputDate);

/** Props for FuiInputDate. */
type FuiInputDateProps = BaseInputDateProps & FieldLayoutProps;
/** Date picker. On desktop renders FluentUI DatePicker; on mobile renders a bottom-sheet calendar drawer. */
const FuiInputDate: React.FC<FuiInputDateProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear =
    value !== null && !props.readOnly && !props.disabled ? () => onChange(null) : undefined;

  return (
    <EnhancedInputDate
      {...rest}
      drawerTitle={props.label ?? props.placeholder}
      onChange={onChange}
      onClear={onClear}
      value={value}
    />
  );
};

/** @internal Mobile date picker variant used by FuiInputDate on narrow viewports. */
export { MobileDate as FuiMobileDate, FuiInputDate };
export type { FuiInputDateProps };
