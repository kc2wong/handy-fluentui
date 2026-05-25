import {
  Label,
  InfoLabel,
  makeStyles,
  tokens,
  Caption1,
  useId,
  mergeClasses,
} from '@fluentui/react-components';
import { EraserRegular } from '@fluentui/react-icons';
import React from 'react';

import { useIsMobile } from '@hook/use-mobile';

const useStyles = makeStyles({
  rootVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  rootHorizontal: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  rootHorizontalRow: {
    flexDirection: 'row',
  },
  rootHorizontalColumn: {
    flexDirection: 'column',
    gap: '2px',
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    overflow: 'hidden',
    flexShrink: 1,
  },
  eraserIcon: {
    cursor: 'pointer',
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
    ':hover': {
      color: tokens.colorNeutralForeground2,
    },
  },
  labelHorizontal: {
    minHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  labelHorizontalColumn: {
    width: '100% !important',
    minHeight: 'auto',
  },
  labelSmall: { width: '10%' },
  labelMedium: { width: '20%' },
  labelLarge: { width: '30%' },
  labelNone: { width: 'auto' },
  labelComponent: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    minWidth: 0,
    flexShrink: 1,
  },
  labelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width: '100%',
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  message: {
    lineHeight: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalM,
  },
  messagePlaceholder: {
    visibility: 'hidden',
  },
  additionalMessage: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
  },
  infoMessage: {
    color: tokens.colorPaletteGreenForeground1  },
});

/**
 * Common layout and labeling properties shared across all input components.
 */
type FieldLayoutProps = {
  /** The text to display as the field label. Pass `null` to completely omit the label container. */
  label?: string | null;
  /** Whether the field is mandatory (displays a red asterisk). */
  required?: boolean;
  /** Supplemental information displayed in a popover (InfoLabel). Triggers rendering of an info icon. */
  hint?: string;
  /** Error message displayed in red below the input. */
  errorMessage?: string;
  /** Informational message displayed in grey below the input (hidden if errorMessage is present). */
  infoMessage?: string;
  /** If true, the message area (error/info) and its reserved 12px space are not rendered. */
  noMessage?: boolean;
  /** Additional message or component to display on the right side of the message container. */
  additionalMessage?: React.ReactNode;
  /** Display eraser icon or not for clearing the content.  Default is true */
  clearable?: boolean;
} &
  /**
   * Layout direction:
   * - 'vertical' (default): Label above the input.
   * - 'horizontal': Label to the left of the input (stacks on mobile).
   */
  (| { direction?: 'vertical'; labelWidth?: never }
    | { direction: 'horizontal'; labelWidth?: 'small' | 'medium' | 'large' | 'none' }
  );

/**
 * A Higher-Order Component that wraps an input component with consistent
 * labeling, validation messaging, and responsive layout logic.
 *
 * @param WrappedComponent The base input component to be enhanced.
 * @returns A component enhanced with standard field layout behaviors.
 */
const withInputField = <P extends { id?: string }>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const ComponentWithInputField = (props: P & FieldLayoutProps & { onClear?: () => void }) => {
    const {
      label = '',
      required,
      hint,
      errorMessage,
      infoMessage,
      noMessage = false,
      direction = 'vertical',
      labelWidth = 'medium',
      additionalMessage,
      clearable = true,
      onClear,
      ...wrappedProps
    } = props as any;

    const styles = useStyles();
    const isMobile = useIsMobile();
    const inputId = useId('input-field');
    const isHorizontal = direction === 'horizontal';

    const labelClasses = mergeClasses(
      isHorizontal && styles.labelHorizontal,
      isHorizontal && isMobile && styles.labelHorizontalColumn,
      isHorizontal && labelWidth === 'small' && styles.labelSmall,
      isHorizontal && labelWidth === 'medium' && styles.labelMedium,
      isHorizontal && labelWidth === 'large' && styles.labelLarge,
      isHorizontal && labelWidth === 'none' && styles.labelNone,
    );

    const hasLabel = label !== null;
    const labelText = label === undefined || label === '' ? '\u00A0' : label;
    const labelTextContent = <span className={styles.labelText}>{labelText}</span>;

    return (
      <div
        className={
          isHorizontal && hasLabel
            ? mergeClasses(
                styles.rootHorizontal,
                isMobile ? styles.rootHorizontalColumn : styles.rootHorizontalRow,
              )
            : styles.rootVertical
        }
      >
        {hasLabel && (
          <div className={mergeClasses(styles.labelContainer, labelClasses)}>
            {hint ? (
              <InfoLabel
                className={styles.labelComponent}
                data-testid="info-label"
                htmlFor={inputId}
                info={hint}
                required={required}
              >
                {labelTextContent}
              </InfoLabel>
            ) : (
              <Label
                className={styles.labelComponent}
                data-testid="label"
                htmlFor={inputId}
                required={required}
              >
                {labelTextContent}
              </Label>
            )}
            {clearable !== false &&
              onClear &&
              wrappedProps.readOnly !== true &&
              wrappedProps.disabled !== true && (
                <EraserRegular
                  className={styles.eraserIcon}
                  data-testid="eraser-icon"
                  onClick={onClear}
                />
              )}
          </div>
        )}
        <div className={styles.fieldGroup}>
          <WrappedComponent {...(wrappedProps as P)} id={inputId} />
          {!noMessage && (
            <div className={styles.messageContainer}>
              <Caption1
                className={mergeClasses(
                  styles.message,
                  errorMessage
                    ? styles.errorMessage
                    : infoMessage
                      ? styles.infoMessage
                      : styles.messagePlaceholder,
                )}
              >
                {errorMessage ?? infoMessage ?? ' '}
              </Caption1>
              {additionalMessage && (
                <Caption1 className={styles.additionalMessage}>{additionalMessage}</Caption1>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return ComponentWithInputField;
};

export { withInputField };
export type { FieldLayoutProps };
