import { useDeviceStore } from '@/store/useDeviceStore';
import { canSelectOutputDevice } from '@/util/env';

const getDefaultOutputLabel = (deviceInfo: MediaDeviceInfo[]): string => {
  const defaultEntry = deviceInfo.find((device) => device.kind === 'audiooutput' && device.deviceId === 'default');
  if (!defaultEntry) {
    return '시스템 기본값';
  }

  const realDevice = deviceInfo.find(
    (device) =>
      device.kind === 'audiooutput' &&
      device.deviceId !== 'default' &&
      device.deviceId !== 'communications' &&
      device.groupId === defaultEntry.groupId,
  );

  const label = realDevice?.label || defaultEntry.label.replace(/^(default|기본값)\s*[-–—]\s*/i, '');
  return label || '시스템 기본값';
};

export const createSystemAudioOutput = (deviceInfo: MediaDeviceInfo[]): MediaDeviceInfo =>
  ({
    deviceId: 'default',
    groupId: 'system',
    kind: 'audiooutput',
    label: getDefaultOutputLabel(deviceInfo),
    toJSON() {
      return { deviceId: this.deviceId, groupId: this.groupId, kind: this.kind, label: this.label };
    },
  }) as MediaDeviceInfo;

const getAudioOutput = (deviceInfo: MediaDeviceInfo[]) => {
  const {
    device: { audioOutput: currentAudioOutput },
  } = useDeviceStore.getState();

  const systemDefault = createSystemAudioOutput(deviceInfo);

  if (!canSelectOutputDevice()) {
    return { audioOutput: systemDefault, audioOutputList: [systemDefault] };
  }

  const defaultEntry = deviceInfo.find((device) => device.kind === 'audiooutput' && device.deviceId === 'default');
  const otherDevices = deviceInfo.filter(
    (device) =>
      device.kind === 'audiooutput' &&
      device.deviceId !== 'default' &&
      device.deviceId !== 'communications' &&
      !(defaultEntry?.groupId && device.groupId === defaultEntry.groupId),
  );
  const audioOutputList = [systemDefault, ...otherDevices];

  const matched =
    currentAudioOutput && currentAudioOutput.deviceId !== 'default'
      ? otherDevices.find((d) => d.deviceId === currentAudioOutput.deviceId)
      : undefined;
  const audioOutput = matched ?? systemDefault;

  return { audioOutput, audioOutputList };
};

export const getCurrentDeviceInfo = async (stream: MediaStream | null) => {
  const audioDeviceId = stream?.getAudioTracks()[0]?.getSettings?.()?.deviceId;
  const videoDeviceId = stream?.getVideoTracks()[0]?.getSettings?.()?.deviceId;

  const deviceInfo = await navigator.mediaDevices.enumerateDevices();

  const audioInputList = deviceInfo.filter(
    (device) => device.kind === 'audioinput' && device.deviceId !== 'default' && device.deviceId !== 'communications',
  );

  const videoInputList = deviceInfo.filter(
    (device) => device.kind === 'videoinput' && device.deviceId !== 'default' && device.deviceId !== 'communications',
  );

  const audioInput = audioInputList.find((d) => d.deviceId === audioDeviceId) ?? null;
  const videoInput = videoInputList.find((d) => d.deviceId === videoDeviceId) ?? null;

  const { audioOutput, audioOutputList } = getAudioOutput(deviceInfo);

  return {
    device: {
      audioInput,
      audioOutput,
      videoInput,
    },
    deviceList: {
      audioInput: audioInputList,
      audioOutput: audioOutputList,
      videoInput: videoInputList,
    },
  };
};
