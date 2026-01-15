'use client';

export const isChromium = () => {
  if (navigator.userAgentData) {
    return navigator.userAgentData.brands.some((data) => data.brand === 'Chromium');
  }
  return false;
};

export const canUseSetSinkId = () => {
  /*   if (typeof window === 'undefined') return false;

  if (!('setSinkId' in HTMLMediaElement.prototype)) return false; */

  const userAgent = window.navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
    (userAgent.includes('Mac') && 'ontouchend' in document);
  if (isMobile) {
    return false;
  }

  const isFirefox = userAgent.includes('firefox');
  if (isFirefox) {
    return false;
  }

  const isMac = /Macintosh|Mac OS X/.test(userAgent);
  const isWindows = /Windows/.test(userAgent);

  const isChrome = /Chrome|Chromium|Edg|Arc|Vivaldi/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|Chromium|Edg|Arc|Vivaldi/.test(userAgent);

  if (isMac && isChrome) {
    return false;
  }

  if (isMac && isSafari) {
    return true;
  }

  if (isWindows && isChrome) {
    return true;
  }

  return false;
};
