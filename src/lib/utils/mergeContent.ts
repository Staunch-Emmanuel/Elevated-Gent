import type { BaseContent } from '@/lib/types/content';

function toTime(value?: Date): number {
  if (!value) return 0;
  return value.getTime();
}

/**
 * Merge static + CMS items and sort by createdAt (newest first).
 */
export function mergeAndSortContent<T extends BaseContent>(
  staticItems: T[],
  cmsItems: T[]
): T[] {
  const merged = [...staticItems, ...cmsItems];

  return merged.sort((a, b) => {
    const aTime = toTime(a.createdAt);
    const bTime = toTime(b.createdAt);
    return bTime - aTime;
  });
}
