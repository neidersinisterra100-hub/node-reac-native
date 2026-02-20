export function formatTimeAmPm(time?: string | null): string {
  if (!time) return "—";

  const normalized = time.trim().toUpperCase();
  const amPmMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (amPmMatch) {
    const [, h, m, period] = amPmMatch;
    const hour = Number(h);
    if (Number.isNaN(hour) || hour < 1 || hour > 12) return time;
    return `${hour}:${m} ${period}`;
  }

  const hhmmMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!hhmmMatch) return time;

  const hour24 = Number(hhmmMatch[1]);
  const minute = hhmmMatch[2];
  if (Number.isNaN(hour24) || hour24 < 0 || hour24 > 23) return time;

  const isPM = hour24 >= 12;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${isPM ? "PM" : "AM"}`;
}

export function toHHmmFromDate(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
