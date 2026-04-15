const relativePattern = /^(\d+)([smhdw])$/;

const unitMs: Record<string, number> = {
	s: 1000,
	m: 60_000,
	h: 3_600_000,
	d: 86_400_000,
	w: 604_800_000,
};

export function parseRelativeTime(value: string, now = new Date()): string {
	const match = relativePattern.exec(value);
	if (!match) return value;
	const [, amount, unit] = match;
	return new Date(now.getTime() - Number(amount) * unitMs[unit]).toISOString();
}
