import { useDeviceStore } from '@/store/useDeviceStore';
import { canSelectOutputDevice } from '@/util/env';

// "시스템 오디오"(시스템 기본 출력) 가상 장치. setSinkId('default')는 시스템 기본 장치를 따라간다.
const SYSTEM_AUDIO_OUTPUT = {
  deviceId: 'default',
  groupId: 'system',
  kind: 'audiooutput' as const,
  label: '시스템 오디오',
  toJSON() {
    return { deviceId: this.deviceId, groupId: this.groupId, kind: this.kind, label: this.label };
  },
} as MediaDeviceInfo;

const getAudioOutput = (deviceInfo: MediaDeviceInfo[]) => {
  const {
    device: { audioOutput: currentAudioOutput },
  } = useDeviceStore.getState();

  // 개별 출력 선택이 불가한 환경(Safari 등): 시스템 오디오만 사용
  if (!canSelectOutputDevice()) {
    return { audioOutput: SYSTEM_AUDIO_OUTPUT, audioOutputList: [SYSTEM_AUDIO_OUTPUT] };
  }

  // Google Meet 방식: "시스템 오디오"(기본) + 개별 장치 목록
  const devices = deviceInfo.filter(
    (device) => device.kind === 'audiooutput' && device.deviceId !== 'default' && device.deviceId !== 'communications',
  );
  const audioOutputList = [SYSTEM_AUDIO_OUTPUT, ...devices];

  const audioOutput =
    currentAudioOutput && audioOutputList.find((d) => d.deviceId === currentAudioOutput.deviceId)
      ? currentAudioOutput
      : SYSTEM_AUDIO_OUTPUT;

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
