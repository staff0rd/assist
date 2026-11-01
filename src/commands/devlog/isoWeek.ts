const DAY_MS = 86_400_000;

const WEEK_ID_PATTERN = /^(\d{4})-W(\d{2})$/;

function toUtc(date: string): Date {
	return new Date(`${date}T00:00:00Z`);
}

function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function isoWeek(date: string): string {
	const d = toUtc(date);
	const dayOfWeek = d.getUTCDay() || 7;
	const thursday = new Date(d.getTime() + (4 - dayOfWeek) * DAY_MS);
	const year = thursday.getUTCFullYear();
	const yearStart = Date.UTC(year, 0, 1);
	const week = Math.ceil(((thursday.getTime() - yearStart) / DAY_MS + 1) / 7);
	return `${year}-W${String(week).padStart(2, "0")}`;
}

export function isoWeekRange(weekId: string): { start: string; end: string } {
	const match = weekId.match(WEEK_ID_PATTERN);
	if (!match) throw new Error(`Invalid week id: ${weekId}`);
	const year = Number(match[1]);
	const week = Number(match[2]);
	const jan4 = new Date(Date.UTC(year, 0, 4));
	const jan4Day = jan4.getUTCDay() || 7;
	const week1Monday = jan4.getTime() - (jan4Day - 1) * DAY_MS;
	const start = new Date(week1Monday + (week - 1) * 7 * DAY_MS);
	const end = new Date(start.getTime() + 6 * DAY_MS);
	return { start: formatDate(start), end: formatDate(end) };
}

export function isValidWeek(weekId: string): boolean {
	const match = weekId.match(WEEK_ID_PATTERN);
	if (!match || Number(match[2]) < 1) return false;
	return isoWeek(isoWeekRange(weekId).start) === weekId;
}

export function addDays(date: string, days: number): string {
	return formatDate(new Date(toUtc(date).getTime() + days * DAY_MS));
}

export function isCompletedWeek(weekId: string, today: string): boolean {
	return isoWeekRange(weekId).end < today;
}
