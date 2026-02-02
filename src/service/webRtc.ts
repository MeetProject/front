import { AppData, DtlsParameters, RtpCapabilities, RtpParameters } from 'mediasoup-client/types';

import { JoinRoomPayloadType, JoinRoomResponseType } from '@/types/session';
import {
  CapabilitiesResponseType,
  ConsumeParamsResponseType,
  Direction,
  RTLSRegisterResponseType,
  TransportParamsResponseType,
} from '@/types/webRtc';

export const requestCapability = async () => {
  const response = await fetch('/api/capabilities');
  return ((await response.json()) as CapabilitiesResponseType).capabilities;
};

export const requestTransportParams = async (direction: Direction) => {
  const response = await fetch('/api/transport', { body: direction, method: 'POST' });
  return ((await response.json()) as TransportParamsResponseType).params;
};

export const requestRegisterDTLS = async (transportId: string, dtlsParameters: DtlsParameters) => {
  await fetch('/api/dtls', {
    body: JSON.stringify({
      dtlsParameters,
      transportId,
    }),
    method: 'POST',
  });
};

export const requestRegisterRTLS = async (transportId: string, rtpParameters: RtpParameters, appData: AppData) => {
  const response = await fetch('/api/rtls', {
    body: JSON.stringify({
      appData,
      rtpParameters,
      transportId,
    }),
    method: 'POST',
  });

  return ((await response.json()) as RTLSRegisterResponseType).id;
};

export const requestConsumeParams = async (
  transportId: string,
  producerId: string,
  rtpCapabilities: RtpCapabilities,
) => {
  const response = await fetch('/api/consume', {
    body: JSON.stringify({
      producerId,
      rtpCapabilities,
      transportId,
    }),
    method: 'POST',
  });

  return ((await response.json()) as ConsumeParamsResponseType).params;
};

export const requestResume = async (consumeId: string) => {
  await fetch('/api/resume', { body: consumeId, method: 'POST' });
};

export const requestJoinRoom = async (payload: JoinRoomPayloadType) => {
  const response = await fetch('/api/join', { body: JSON.stringify(payload), method: 'POST' });
  return ((await response.json()) as JoinRoomResponseType).participantData;
};
