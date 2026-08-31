import { Tag, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import * as React from 'react';

type FuiTagSize = 'small' | 'medium' | 'large';

type FuiTagBaseProps = {
  /** Text displayed on the tag. */
  label: string;
  /** Visual size of the tag. Defaults to 'medium'. Fluent's own Tag size only goes up to
   * 'medium' and uses a different scale, so all three sizes are driven by custom classes here
   * instead — mirrors handy-shadcnui's own hui-tag.tsx, which does the same against Badge. */
  size?: FuiTagSize;
  /** Custom CSS class for the tag. */
  className?: string;
};

const useStyles = makeStyles({
  small: {
    height: tokens.spacingVerticalL,
    columnGap: tokens.spacingHorizontalXS,
    paddingLeft: tokens.spacingHorizontalSNudge,
    paddingRight: tokens.spacingHorizontalSNudge,
    fontSize: tokens.fontSizeBase100,
  },
  medium: {
    height: tokens.spacingVerticalXXL,
    columnGap: tokens.spacingHorizontalSNudge,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase200,
  },
  large: {
    height: tokens.spacingVerticalXXXL,
    columnGap: tokens.spacingHorizontalS,
    paddingLeft: tokens.spacingHorizontalMNudge,
    paddingRight: tokens.spacingHorizontalMNudge,
    fontSize: tokens.fontSizeBase300,
  },
  clickable: {
    cursor: 'pointer',
  },
});

/**
 * onClick and onRemove are mutually exclusive: onClick makes the whole tag clickable; onRemove
 * renders a trailing "x" that fires the callback instead of the tag itself being clickable.
 * Provide neither for a plain, non-interactive tag.
 */
type FuiTagProps = FuiTagBaseProps &
  ({ onClick?: () => void; onRemove?: never } | { onClick?: never; onRemove?: () => void });

/** Small pill used to display a single clickable or removable value, e.g. an active filter. */
const FuiTag: React.FC<FuiTagProps> = ({ label, onClick, onRemove, size = 'medium', className }) => {
  const styles = useStyles();
  const sizeClassName = { small: styles.small, medium: styles.medium, large: styles.large }[size];

  if (onRemove) {
    return (
      <Tag
        appearance="filled"
        className={mergeClasses(sizeClassName, className)}
        dismissible
        dismissIcon={{
          'aria-label': `Remove ${label}`,
          children: <DismissRegular />,
          onClick: onRemove,
          role: 'button',
        }}
        shape="rounded"
      >
        {label}
      </Tag>
    );
  }

  return (
    <Tag
      appearance="filled"
      className={mergeClasses(sizeClassName, onClick && styles.clickable, className)}
      onClick={onClick}
      shape="rounded"
    >
      {label}
    </Tag>
  );
};

export { FuiTag };
export type { FuiTagProps, FuiTagSize };
