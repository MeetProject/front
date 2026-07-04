export const DEVICE_KINDS = ['audio', 'video'] as const;

export type DeviceKindType = (typeof DEVICE_KINDS)[number];

export type DeviceType = 'audioInput' | 'videoInput' | 'audioOutput';
export type DeviceEnableType = Record<DeviceKindType, boolean>;

export type StatusType = null | 'failed' | 'success' | 'rejected' | 'pending';

export type TrackType = DeviceKindType | 'screen';
