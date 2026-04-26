import { Media } from '@/components';
import { useAudioStore } from '@/store/useAudioStore';

export default function ScreenAudio() {
  const masterStream = useAudioStore((state) => state.audioStream);

  return <Media autoPlay={true} stream={masterStream ?? undefined} tag='audio' />;
}
