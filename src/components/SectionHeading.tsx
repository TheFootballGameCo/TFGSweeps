import type { ReactNode } from 'react';

export default function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      {action}
    </div>
  );
}
