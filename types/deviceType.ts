export type DeviceKindType = 'audio' | 'video';

export type DeviceType = 'audioInput' | 'videoInput' | 'audioOutput';
export type DeviceEnableType = Record<DeviceKindType, boolean>;

export type StatusType = null | 'failed' | 'success' | 'rejected' | 'pending';
