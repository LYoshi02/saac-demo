interface IconProps {
  className?: string;
}

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
};

export function TimerIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
      <path d="M12 2v3" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M7 13h4" />
      <path d="M7 17h7" />
    </svg>
  );
}

export function StepsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="9" width="5" height="6" rx="1" />
      <rect x="9.5" y="9" width="5" height="6" rx="1" />
      <rect x="17" y="9" width="5" height="6" rx="1" />
      <path d="M7 12h2.5" />
      <path d="M14.5 12H17" />
    </svg>
  );
}

