/* Ícones lineares no traço do SF Symbols (2 px, cantos arredondados). */
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const ChevronLeft = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.4}><path d="M15 5l-7 7 7 7" /></svg>
);
export const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.4}><path d="M9 5l7 7-7 7" /></svg>
);
export const Check = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const Clock = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Calendar = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const Pin = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const Chat = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1-4.1A8 8 0 1 1 20 12z" /></svg>
);
