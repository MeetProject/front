'use client';

import Dialog from '../_shared/Dialog';

interface SettingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Setting({ isOpen, onClose }: SettingProps) {
  return (
    <Dialog isOpen={isOpen} position='center' onClose={onClose}>
      <div className='size-100'>test</div>
    </Dialog>
  );
}
