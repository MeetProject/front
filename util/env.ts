export const isChromium = () => {
  if (navigator.userAgentData) {
    return navigator.userAgentData.brands.some((data) => data.brand === 'Chromium');
  }
  return false;
};
