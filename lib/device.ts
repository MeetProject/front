import { useDeviceStore } from '@/store/useDeviceStore';
import { canUseSetSinkId } from '@/util/env';

const getAudioOutput = (deviceInfo: MediaDeviceInfo[]) => {
  const {
    device: { audioOutput: currentAudioOutput },
  } = useDeviceStore.getState();
  const isSupportedSinkId = canUseSetSinkId();

  const audioOutputList = deviceInfo.filter(
    (device) => device.kind === 'audiooutput' && device.deviceId !== 'default' && device.deviceId !== 'communications',
  );

  const defaultAudioOutput =
    deviceInfo.find((device) => device.kind === 'audiooutput' && device.deviceId === 'default') ?? null;

  if (isSupportedSinkId) {
    return {
      audioOutput:
        currentAudioOutput && audioOutputList.find((d) => d.groupId === currentAudioOutput.groupId)
          ? currentAudioOutput
          : (audioOutputList.find((d) => d.groupId === (defaultAudioOutput?.groupId ?? 'none')) ?? null),
      audioOutputList: audioOutputList,
    };
  }
  return { audioOutput: defaultAudioOutput, audioOutputList: defaultAudioOutput ? [defaultAudioOutput] : [] };
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
