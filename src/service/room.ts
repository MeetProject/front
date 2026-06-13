import { RoomCreateResponseType, RoomValidateResponseType } from '@/types/roomType';
import { API_URL } from '@/util/api';

const FETCH_TIMEOUT_MS = 10000;

export const createRoom = async () => {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error('방 생성 api 오류');
  }
  const data = (await response.json()) as RoomCreateResponseType;
  return data;
};

export const validateRoom = async (roomId: string) => {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}/validate`, {
    cache: 'no-cache',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error('방 id 검사 api 오류');
  }

  const data = (await response.json()) as RoomValidateResponseType;
  return data;
};
