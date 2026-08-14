import {
  Tab,
  TabList,
  makeStyles,
  mergeClasses,
  tokens,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components';
import React from 'react';

import { useIsMobile } from '@hook/use-mobile';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  rootVertical: {
    flexDirection: 'row',
  },
  tabList: {
    width: 'max-content',
  },
  tabListVertical: {
    borderBottom: 'none',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: '0',
    width: 'auto',
  },
  scrollWrapper: {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    '::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  content: {
    paddingTop: tokens.spacingVerticalM,
    flexGrow: 1,
  },
  contentVertical: {
    paddingTop: '0',
    paddingLeft: tokens.spacingHorizontalM,
  },
  tabTextSelected: {
    color: tokens.colorBrandForeground1,
  },
});

/** Accepted tab identifier type. */
type FuiTabValue = string | number;

/** Config for a single tab. value defaults to name when omitted. */
type FuiTabProps<T extends FuiTabValue = FuiTabValue> = {
  name: string;
  value?: T;
  icon?: React.ReactElement;
  disabled?: boolean;
  children?: React.ReactNode;
};

const TAB_MARKER = Symbol.for('FuiTab');

/** Config-carrier for a single tab. Must be a direct child of FuiTabList. Renders nothing itself. */
const FuiTab = Object.assign(<T extends FuiTabValue>(_props: FuiTabProps<T>) => null, {
  _marker: TAB_MARKER,
});

/** Data passed to onTabSelect, narrowed to T. */
type FuiSelectTabData<T extends FuiTabValue> = { value: T };

/** Props for FuiTabList. selectedValue and onTabSelect are typed to T. */
type FuiTabListProps<T extends FuiTabValue = FuiTabValue> = {
  selectedValue?: T;
  onTabSelect?: (data: FuiSelectTabData<T>) => void;
  /** Renders tabs down the side with content to the right. Forced to false on mobile. */
  vertical?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Tab list with an inline content panel. Forces horizontal layout on mobile regardless of the vertical prop. */
const FuiTabList = <T extends FuiTabValue>(props: FuiTabListProps<T>) => {
  const { children, vertical, selectedValue, onTabSelect, className, style } = props;
  const isMobile = useIsMobile();
  const styles = useStyles();

  const isVertical = !isMobile && vertical;

  // Extract tab definitions from children
  const tabs = React.Children.toArray(children)
    .filter(
      (child): child is React.ReactElement<FuiTabProps<T>> =>
        React.isValidElement(child) && (child.type as any)?._marker === TAB_MARKER
    )
    .map((child) => ({
      props: child.props,
      value: (child.props.value ?? child.props.name) as T,
    }));

  const handleTabSelect = (_ev: SelectTabEvent, data: SelectTabData) => {
    onTabSelect?.(data as FuiSelectTabData<T>);
  };

  const tabList = (
    <TabList
      className={mergeClasses(isVertical ? styles.tabListVertical : styles.tabList, className)}
      onTabSelect={handleTabSelect}
      selectedValue={selectedValue}
      style={style}
      vertical={isVertical}
    >
      {tabs.map((tab) => (
        <Tab
          key={String(tab.value)}
          disabled={tab.props.disabled}
          icon={tab.props.icon}
          value={tab.value}
        >
          <span className={tab.value === selectedValue ? styles.tabTextSelected : undefined}>
            {tab.props.name}
          </span>
        </Tab>
      ))}
    </TabList>
  );

  const selectedTab = tabs.find((t) => t.value === selectedValue);

  return (
    <div className={mergeClasses(styles.root, isVertical && styles.rootVertical)}>
      {isMobile ? <div className={styles.scrollWrapper}>{tabList}</div> : tabList}
      {selectedTab && (
        <div className={mergeClasses(styles.content, isVertical && styles.contentVertical)}>
          {selectedTab.props.children}
        </div>
      )}
    </div>
  );
};

export { FuiTab, FuiTabList };
export type { FuiTabProps, FuiTabListProps };
