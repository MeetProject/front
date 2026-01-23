export const RIGHT_DRAWER_KEYS = ['info', 'chat'] as const;

export type RightDrawerKeyType = (typeof RIGHT_DRAWER_KEYS)[number];
export type DrawerKeyType = 'cc' | 'emoji' | RightDrawerKeyType;
