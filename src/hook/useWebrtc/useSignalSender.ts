import { useCallback } from 'react';

import { DeviceEnableType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';
import { ChatPayloadType, DevicePayloadType, EmojiPayloadType, HandUpPayloadType } from '@/types/session';

export const useSignalSender = (publish: <T>(destination: string, payload?: T | undefined) => void) => {
  const sendChat = useCallback(
    (message: string) => {
      publish<ChatPayloadType>(`/app/chat/send`, {
        message,
      });
    },
    [publish],
  );

  const sendDeviceEnable = useCallback(
    (deviceEnable: DeviceEnableType) => {
      publish<DevicePayloadType>('/app/device', {
        mediaOption: deviceEnable,
      });
    },
    [publish],
  );

  const sendEmoji = useCallback(
    (emoji: EmojiType) => {
      publish<EmojiPayloadType>('/app/emoji', {
        emoji,
      });
    },
    [publish],
  );

  const sendHandUp = useCallback(
    (value: boolean) => {
      publish<HandUpPayloadType>('/app/handUp', {
        value,
      });
    },
    [publish],
  );

  const sendLeave = useCallback(() => {
    publish('/app/leave');
  }, [publish]);

  return { sendChat, sendDeviceEnable, sendEmoji, sendHandUp, sendLeave };
};
