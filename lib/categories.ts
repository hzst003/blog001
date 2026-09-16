export const PRODUCT_CATEGORIES = ['酒水', '啤酒', '饮料', '其它'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_FILTERS = ['全部', ...PRODUCT_CATEGORIES] as const;
