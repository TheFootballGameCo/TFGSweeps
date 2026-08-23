// Flat shirt-colour avatars matched to the TFG Sweeps artwork.
// Each player owns one of the four coloured shirts; anyone else gets a
// deterministic muted fallback.
import { initials, hueFor } from '../lib/ui';

const SHIRTS: Record<string, { bg: string; text: string }> = {
  Jack: { bg: '#A4463F', text: '#F2EAD9' }, // muted red
  Sam: { bg: '#DEAA5E', text: '#26323B' }, // mustard
  Jamie: { bg: '#4D8461', text: '#F2EAD9' }, // green
  Simon: { bg: '#304A6F', text: '#F2EAD9' }, // blue
};

export default function MemberAvatar({
  id,
  name,
  size = 36,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const shirt = SHIRTS[name] ?? {
    bg: `hsl(${hueFor(id)} 30% 45%)`,
    text: '#F2EAD9',
  };
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: shirt.bg,
        color: shirt.text,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
