const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const API_URL = API_BASE_URL;
export const WS_URL = `${API_BASE_URL}/ws`;
