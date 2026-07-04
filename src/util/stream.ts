import { DeviceEnableType } from '@/types/deviceType';

export const stopStream = (stream: MediaStream | null | undefined) => {
  stream?.getTracks().forEach((track) => track.stop());
};

export const applyDeviceEnable = (stream: MediaStream, deviceEnable: DeviceEnableType) => {
  if (!deviceEnable.audio) {
    stream.getAudioTracks().forEach((track) => (track.enabled = false));
  }

  if (!deviceEnable.video) {
    stream.getVideoTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });
  }
};

export const replaceUserStream = (prev: MediaStream | undefined, track: MediaStreamTrack): MediaStream => {
  stopStream(prev);
  return new MediaStream([track]);
};

export const mergeScreenTrack = (
  prevStream: MediaStream | null,
  prevUserId: string | null,
  userId: string,
  track: MediaStreamTrack,
): MediaStream => {
  if (prevUserId !== userId && prevStream) {
    prevStream.getTracks().forEach((t) => {
      t.stop();
      prevStream.removeTrack(t);
    });
  }

  const baseTracks = prevUserId === userId ? (prevStream?.getTracks() ?? []) : [];
  const newStream = new MediaStream(baseTracks);
  newStream.addTrack(track);
  return newStream;
};
