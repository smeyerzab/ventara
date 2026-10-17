import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Home = (p: P) => (
  <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></svg>
);
export const Swap = (p: P) => (
  <svg {...base} {...p}><path d="M4 8h13l-3.5-3.5" /><path d="M20 16H7l3.5 3.5" /></svg>
);
export const Layers = (p: P) => (
  <svg {...base} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>
);
export const Sliders = (p: P) => (
  <svg {...base} {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
);
export const Compass = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>
);
export const Arrow = (p: P) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowDown = (p: P) => (
  <svg {...base} {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const Device = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 13c1.2 0 1.6-3 2.8-3s1.6 5 2.8 5 1.6-3 2.8-3H17" /></svg>
);
export const Calc = (p: P) => (
  <svg {...base} {...p}><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 15.5h.01M12 15.5h.01M15 15.5h.01" /></svg>
);
export const Alert = (p: P) => (
  <svg {...base} {...p}><path d="M12 4 2.8 19.5h18.4L12 4Z" /><path d="M12 10v4M12 17h.01" /></svg>
);
export const Info = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const Link = (p: P) => (
  <svg {...base} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
export const Copy = (p: P) => (
  <svg {...base} {...p}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></svg>
);
export const Printer = (p: P) => (
  <svg {...base} {...p}><path d="M7 9V4h10v5" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v6H7z" /></svg>
);
export const Reset = (p: P) => (
  <svg {...base} {...p}><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" /><path d="M4 4v4.5h4.5" /></svg>
);
export const Check = (p: P) => (
  <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base} {...p}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const Offline = (p: P) => (
  <svg {...base} {...p}><path d="M12 19h.01M8.5 15.5a5 5 0 0 1 7 0M5 12a10 10 0 0 1 14 0" /><path d="M3 3l18 18" /></svg>
);
export const Eye = (p: P) => (
  <svg {...base} {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);

export const Logo = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="6" fill="var(--blue)" />
    <path
      d="M5 18.5h4.2c1.3 0 1.7-7.5 3.4-7.5s2.1 10 3.9 10 2-6 3.4-6 1.6 3.5 3 3.5H27"
      fill="none"
      stroke="var(--on-blue)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="26" cy="8" r="3" fill="var(--yellow)" />
  </svg>
);
