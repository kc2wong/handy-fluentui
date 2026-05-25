import { useContext } from 'react';

import { BreadcrumbItem, FuiBreadcrumbContext } from '@context/breadcrumb-context';

import { useLogger } from './use-logger';

/**
 * Hook to manage a global breadcrumb trail.
 * Actions provided to start() or append() are automatically wrapped to truncate the trail when invoked.
 */
const useBreadcrumb = () => {
  const ctx = useContext(FuiBreadcrumbContext);
  if (!ctx) {
    throw new Error('useBreadcrumb must be used within FuiBreadcrumbContextProvider');
  }

  const logger = useLogger();

  return {
    /** Current breadcrumb items in the trail. */
    items: [...ctx.items],

    /** Resets the trail with the provided item. Action is reconstructed to handle truncation. */
    start: (item: BreadcrumbItem) => {
      logger.debug(`[useBreadcrumb] start() with tag ${item.tag}`);
      const action = item.action;
      const wrapped: BreadcrumbItem = {
        ...item,
        action: action
          ? () => {
              action();
              ctx.setItems([wrapped]);
            }
          : undefined,
      };
      ctx.setItems([wrapped]);
    },

    /** Appends an item to the current trail. Action is reconstructed to handle truncation. */
    append: (item: BreadcrumbItem) => {
      logger.debug(
        `[useBreadcrumb] append() with tag ${item.tag}, action = ${item.action === undefined}`,
      );
      const action = item.action;
      const wrapped: BreadcrumbItem = {
        ...item,
        action: action
          ? () => {
              action();
              // targetIndex is resolved inside the updater to use the live state
              ctx.setItems((current) => {
                const idx = current.findIndex((i) => i === wrapped);
                return current.slice(0, idx + 1);
              });
            }
          : undefined,
      };
      ctx.setItems((current) => {
        const last = current[current.length - 1];
        if (item.tag !== undefined && last?.tag === item.tag) {
          logger.warn(
            `[useBreadcrumb] append(), the tag of last item is ${item.tag}, ignored append`,
          );
          return current;
        }
        return [...current, wrapped];
      });
    },

    /** Get the last item in current trail */
    peek: (): BreadcrumbItem | undefined => {
      return ctx.items[ctx.items.length - 1];
    },

    /** Removes items from the trail. If tillTag is provided, removes until that item (inclusive). Otherwise removes one. */
    popTill: (tillTag?: string) => {
      logger.debug(`[useBreadcrumb] popTill(), no of items = ${ctx.items.length}`);
      ctx.setItems((current) => {
        if (tillTag) {
          const index = current.findIndex((item) => item.tag === tillTag);
          if (index === -1) {
            logger.warn(`[useBreadcrumb] popTill(), tag "${tillTag}" not found, trail unchanged`);
            return current;
          }
          return current.slice(0, index);
        }
        if (current.length === 0) {
          return current;
        }
        const rtn = current.slice(0, -1);
        logger.debug(`[useBreadcrumb] popTill(), no of items after pop = ${rtn.length}`);
        return rtn;
      });
    },
  };
};

export { useBreadcrumb };
