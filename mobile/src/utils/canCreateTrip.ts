import { transports } from "../data/transports";

export function canCreateTrip(ownerId: string): boolean {
  const today = new Date().getDay(); // 0–6

  return transports.some(
    (t) =>
      t.ownerId === ownerId &&
      t.allowedDays.includes(today)
  );
}
