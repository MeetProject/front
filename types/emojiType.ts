export type EmojiType =
  | 'CLAP'
  | 'CURIOUS'
  | 'HEART'
  | 'LAUGHTER'
  | 'PARTYPOPPER'
  | 'SAD'
  | 'SURPRISE'
  | 'THUMBDOWN'
  | 'THUMBUP';

export interface EmojiDataType {
  userId: string;
  emoji: EmojiType;
  timestamp: string;
}
