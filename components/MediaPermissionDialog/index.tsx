'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import Dialog from '../_shared/Dialog';

import MediaPermissionBlocked from './MediaPermissionBlocked';
import MediaPermissionPrompt from './MediaPermissionPrompt';

import { useDeviceStore } from '@/store/useDeviceStore';

interface MediaPermissionDialogProps {
  isOpen: boolean;
  type: 'permissionDeny' | 'permissionRequire' | null;
  onClose: (value: 'setting' | null) => void;
}

export default function MediaPermissionDialog({ isOpen, onClose, type }: MediaPermissionDialogProps) {
  const { permission } = useDeviceStore(
    useShallow((state) => ({
      permission: state.permission,
    })),
  );
  const [contentType, setContentType] = useState<'permissionDeny' | 'permissionRequire'>(type ?? 'permissionRequire');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const values = Object.values(permission);

    const hasNoPrompt = values.every((status) => status !== 'prompt');
    const hasAllDenied = values.every((status) => status === 'denied');

    if (hasNoPrompt && !hasAllDenied) {
      onClose('setting');
      return;
    }

    if (hasAllDenied) {
      setContentType('permissionDeny');
    }
  }, [permission, onClose, isOpen]);

  return (
    <Dialog
      className='min-w-80 rounded-4xl'
      closeOnOutsideClick={contentType === 'permissionDeny'}
      description='장치 권한을 허용해주세요.'
      isOpen={isOpen}
      position='center'
      title='장치 권한 요청'
      onClose={() => onClose(null)}
    >
      {contentType === 'permissionRequire' ? <MediaPermissionPrompt /> : <MediaPermissionBlocked />}
    </Dialog>
  );
}
