'use client';

import { useCallback, useState } from 'react';

import { useDrawerStore } from '@/store/useDrawer';
import { DrawerKeyType } from '@/types/drawerType';

const useDrawerHover = (key: DrawerKeyType) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleHoverOn = useCallback(() => {
    setIsHover(true);
  }, []);

  const handleHoverOff = useCallback(() => {
    setIsHover(false);
  }, []);

  const handleDrawerOpen = useCallback(
    (value?: boolean) => {
      const { toggleDrawer } = useDrawerStore.getState();
      toggleDrawer(key, value);
      setIsHover(false);
    },
    [key],
  );

  return { handleDrawerOpen, handleHoverOff, handleHoverOn, isHover };
};

export default useDrawerHover;
