import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbButton,
  BreadcrumbDivider,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';
import { MoreHorizontalRegular } from '@fluentui/react-icons';
import React, { Fragment } from 'react';

import { BreadcrumbItem as BreadcrumbItemData } from '@context/breadcrumb-context';
import { useBreadcrumb } from '@hook/use-breadcrumb';

const useStyles = makeStyles({
  nonInteractiveItem: {
    color: tokens.colorNeutralForeground2,
    backgroundColor: 'transparent',
    cursor: 'default',
  },
  currentItem: {
    fontSize: tokens.fontSizeBase400,
  },
});

/**
 * Renders the current trail from useBreadcrumb(). The last item is shown as the current page
 * (larger); earlier items without an action are shown as non-interactive labels. Once there are
 * at least 3 items, clicking the last item toggles between the full trail and a collapsed
 * first > … > last view (clicking the "…" also expands it), driven by useBreadcrumb()'s own
 * isCollapsed/toggleCollapsed.
 */
const FuiBreadcrumb: React.FC = () => {
  const styles = useStyles();
  const { items, isCollapsed, toggleCollapsed } = useBreadcrumb();
  const canCollapse = items.length >= 3;
  const showCollapsed = canCollapse && isCollapsed;

  const renderItem = (item: BreadcrumbItemData, isLast: boolean) => {
    const label = item.label();
    const isNonInteractive = !item.action && !isLast;
    // BreadcrumbButton forces aria-disabled: true whenever current is set, unless overridden here —
    // so the last item needs an explicit override to stay clickable when canCollapse is true.
    const isDisabled = isLast ? !canCollapse : isNonInteractive;

    return (
      <BreadcrumbButton
        aria-disabled={isDisabled}
        className={mergeClasses(
          isNonInteractive && styles.nonInteractiveItem,
          isLast && styles.currentItem,
        )}
        current={isLast}
        disabled={isDisabled}
        onClick={isLast ? toggleCollapsed : item.action}
        // BreadcrumbButton's own "current" styles force cursor: auto on hover regardless of
        // disabled state — override inline since that's the only thing guaranteed to win.
        style={isLast && !isDisabled ? { cursor: 'pointer' } : undefined}
      >
        {label}
      </BreadcrumbButton>
    );
  };

  if (showCollapsed) {
    return (
      <Breadcrumb>
        <BreadcrumbItem>{renderItem(items[0], false)}</BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton
            aria-label="Expand breadcrumb"
            icon={<MoreHorizontalRegular />}
            onClick={toggleCollapsed}
          />
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>{renderItem(items[items.length - 1], true)}</BreadcrumbItem>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>{renderItem(item, isLast)}</BreadcrumbItem>
            {!isLast && <BreadcrumbDivider />}
          </Fragment>
        );
      })}
    </Breadcrumb>
  );
};

export { FuiBreadcrumb };
