'use client';

import Dialog from '../_shared/Dialog';

import MediaPermissionBlocked from './MediaPermissionBlocked';
import MediaPermissionPrompt from './MediaPermissionPrompt';

import { useDeviceStore } from '@/store/useDeviceStore';

interface MediaPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaPermissionDialog({ isOpen, onClose }: MediaPermissionDialogProps) {
  const permission = useDeviceStore((state) => state.permission);
  const isRequiredPermission = Object.values(permission).some((state) => state !== 'granted');

  return (
    <Dialog
      className='min-w-80 rounded-4xl'
      description='장치 권한을 허용해주세요.'
      isOpen={isOpen}
      position='center'
      title='장치 권한 요청'
      onClose={onClose}
    >
      {isRequiredPermission ? <MediaPermissionPrompt /> : <MediaPermissionBlocked />}
    </Dialog>
  );
}
