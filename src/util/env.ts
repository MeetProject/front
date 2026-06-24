'use client';

import { DeviceKindType } from '@/types/deviceType';

export const queryDevicePermission = async (type: DeviceKindType): Promise<PermissionState | null> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return null;
  }

  try {
    const name: PermissionName = type === 'audio' ? 'microphone' : 'camera';
    const status = await navigator.permissions.query({ name });
    return status.state;
  } catch {
    return null;
  }
};

export const isChromium = () => {
  if (navigator.userAgentData) {
    return navigator.userAgentData.brands.some((data) => data.brand === 'Chromium');
  }
  return false;
};

export const canUseSetSinkId = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const supportsMediaSetSinkId = 'setSinkId' in HTMLMediaElement.prototype;
  const supportsAudioCtxSetSinkId = 'AudioContext' in window && 'setSinkId' in AudioContext.prototype;

  if (!supportsMediaSetSinkId && !supportsAudioCtxSetSinkId) {
    return false;
  }

  const userAgent = window.navigator.userAgent;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
    (navigator.maxTouchPoints > 0 && /Mac/.test(userAgent));

  if (isMobile) {
    return false;
  }

  const isFirefox = userAgent.toLowerCase().includes('firefox');
  if (isFirefox) {
    return false;
  }

  return true;
};

export const isSafari = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('safari') &&
    !userAgent.includes('chrome') &&
    !userAgent.includes('chromium') &&
    !userAgent.includes('crios') &&
    !userAgent.includes('fxios') &&
    !userAgent.includes('edg')
  );
};
export const canSelectOutputDevice = (): boolean => canUseSetSinkId() && !isSafari();

export const isScreenShareSupported = () =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getDisplayMedia === 'function';

export const isMac = () => {
  if (navigator.userAgentData) {
    return navigator.userAgentData.platform.toLowerCase().includes('mac');
  }

  const platform = navigator.platform?.toLowerCase() || '';
  const userAgent = navigator.userAgent.toLowerCase();

  return platform.includes('mac') || userAgent.includes('macintosh');
};
