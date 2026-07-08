// Coloured initials avatar, deterministic per user.
import { initials, hueFor } from '../lib/ui';

export default function MemberAvatar({
  id,
  name,
  size = 36,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const hue = hueFor(id);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 40) % 360} 65% 38%))`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
