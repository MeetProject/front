import { RoomCreateResponseType, RoomValidateResponseType } from '@/types/roomType';

const DOMAIN = 'http://localhost:8080';

export const createRoom = async () => {
  const response = await fetch(`${DOMAIN}/api/rooms`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('방 생성 api 오류');
  }
  const data = (await response.json()) as RoomCreateResponseType;
  return data;
};

export const validateRoom = async (roomId: string) => {
  const response = await fetch(`${DOMAIN}/api/rooms/${roomId}/validate`, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error('방 id 검사 api 오류');
  }

  const data = (await response.json()) as RoomValidateResponseType;
  return data;
};

export const leaveRoom = async (roomId: string, userId: string) => {
  await fetch(`${DOMAIN}/api/rooms/${roomId}/leave?userId=${userId}`);
};
