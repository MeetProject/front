export const RIGHT_PANEL_KEYS = ['info', 'chat'] as const;

export type RightPanelKeyType = (typeof RIGHT_PANEL_KEYS)[number];
export type DrawerKeyType = 'cc' | 'emoji' | RightPanelKeyType;
