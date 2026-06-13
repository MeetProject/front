import { UserRegisterPayloadType, UserRegisterResponseType } from '@/types/userType';
import { API_URL } from '@/util/api';

export const register = async (payload: UserRegisterPayloadType) => {
  const response = await fetch(`${API_URL}/api/users`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error('회원 등록 실패');
  }

  const data = (await response.json()) as UserRegisterResponseType;
  return data;
};
