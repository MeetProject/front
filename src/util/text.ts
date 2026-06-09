const formatNumber = (number: number) => number.toString().padStart(2, '0');

export const formatTime = (date: Date | string | null) => {
  if (date === null) {
    return '오전 12:00';
  }
  const newDate = new Date(date);

  if (!newDate.getTime()) {
    return '시간 오류';
  }
  const hour = newDate.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = formatNumber(hour % 12 || 12);
  const minute = formatNumber(newDate.getMinutes());

  return `${period} ${hour12}:${minute}`;
};

export const formatDate = (date: Date | string | null) => {
  if (!date) {
    return '01월 01일 (월)';
  }
  const newDate = new Date(date);
  if (!newDate.getTime()) {
    return '날짜 오류';
  }
  const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  const month = formatNumber(newDate.getMonth() + 1);
  const day = formatNumber(newDate.getDate());
  const week = WEEK[newDate.getDay()];

  return `${month}월 ${day}일 (${week})`;
};

const SHORT_CUT_KEY = {
  Control: 'Ctrl',
  Meta: '⌘',
} as const;

export const formatShortcut = (shortcutKey: string[]) =>
  '(' + shortcutKey.map((el) => SHORT_CUT_KEY[el as keyof typeof SHORT_CUT_KEY] ?? el).join(' + ') + ')';

const FIRST_CONSTANT = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const OFFSET = '가'.charCodeAt(0);

const FIRST_OFFSET_RANGE = 21 * 28;
const MIDDLE_OFFSET_RANGE = 28;

const charCode = (first: number, middle: number, last: number) =>
  String.fromCharCode(OFFSET + first * FIRST_OFFSET_RANGE + middle * MIDDLE_OFFSET_RANGE + last);

export const charMatcher = (search = '') => {
  if (!search) {
    return /(?:)/;
  }

  const regex = FIRST_CONSTANT.reduce(
    (accumulator, first, index) =>
      accumulator.replace(new RegExp(first, 'g'), `[${charCode(index, 0, 0)}-${charCode(index + 1, 0, -1)}]`),
    search,
  );

  return new RegExp(`(${regex})`, 'g');
};
