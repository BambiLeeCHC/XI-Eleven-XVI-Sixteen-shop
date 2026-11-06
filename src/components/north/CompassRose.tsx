export function CompassRose({ size = 88 }: { size?: number }) {
  return (
    <svg className="tn-compass" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(228,212,244,0.8)" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(216,240,196,0.7)" strokeWidth="1" />
      <circle cx="50" cy="50" r="6" fill="#d8f0c4" />
      <path d="M50 8 L54 46 L50 42 L46 46 Z" fill="#f6f1e8" />
      <path d="M50 92 L46 54 L50 58 L54 54 Z" fill="rgba(228,212,244,0.8)" />
      <path d="M16 54 Q28 50 40 46" fill="none" stroke="#f4efe6" strokeWidth="1.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 50 + Math.cos(a) * 40;
        const y1 = 50 + Math.sin(a) * 40;
        const x2 = 50 + Math.cos(a) * 45;
        const y2 = 50 + Math.sin(a) * 45;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(247,240,230,0.7)" strokeWidth="1" />;
      })}
    </svg>
  );
}
