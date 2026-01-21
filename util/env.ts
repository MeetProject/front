'use client';

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

  // 모바일 환경 제외
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
    (navigator.maxTouchPoints > 0 && /Mac/.test(userAgent));

  if (isMobile) {
    return false;
  }

  // Firefox 제외
  const isFirefox = userAgent.toLowerCase().includes('firefox');
  if (isFirefox) {
    return false;
  }

  return true;
};

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
