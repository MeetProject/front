import { RoomCreateResponseType, RoomValidateResponseType } from '@/types/roomType';
import { API_URL } from '@/util/api';

export const createRoom = async () => {
  const response = await fetch(`${API_URL}/api/rooms`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('방 생성 api 오류');
  }
  const data = (await response.json()) as RoomCreateResponseType;
  return data;
};

export const validateRoom = async (roomId: string) => {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}/validate`, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error('방 id 검사 api 오류');
  }

  const data = (await response.json()) as RoomValidateResponseType;
  return data;
};
