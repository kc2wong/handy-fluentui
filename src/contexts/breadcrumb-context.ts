import { createContext } from 'react';

/** Represents a single item in the breadcrumb trail. */
type BreadcrumbItem = {
  /** Optional user-provided tag for identifying the item. */
  tag?: string;
  /** Label supplier for the breadcrumb item. */
  label: () => string;
  /** Optional action to trigger when the breadcrumb item is clicked. The trail is automatically truncated up to this item. */
  action?: () => void;
};

/** Context type for managing the global breadcrumb trail. */
type BreadcrumbContextType = {
  /** Current items in the breadcrumb trail. */
  items: BreadcrumbItem[];
  /** State setter for the breadcrumb items. */
  setItems: React.Dispatch<React.SetStateAction<BreadcrumbItem[]>>;
  /** Whether the trail is collapsed down to first > … > last (true) or showing all items (false). */
  isCollapsed: boolean;
  /** State setter for isCollapsed. */
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export { BreadcrumbContext as FuiBreadcrumbContext };
export type { BreadcrumbItem };
