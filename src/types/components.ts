export interface Alert {
  id: number;
  message: string;
}

export type FeedbackCategoryType = 'suggest' | 'report' | null;

type LayoutMode = 'sidebar' | 'top' | 'full' | null;

export interface PresentationLayoutType {
  mode: LayoutMode;
  mainArea: { width: number; height: number };
  participantArea: {
    width: number;
    height: number;
    cols: number;
    rows: number;
    size: number;
  };
}
