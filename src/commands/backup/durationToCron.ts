const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

/**
 * Translate a free-form duration (e.g. `5m`, `6h`) into a cron expression that
 * fires on an even cadence. Durations cron cannot represent evenly are rejected:
 * sub-minute intervals, minute counts that don't divide 60, and hour counts that
 * don't divide 24 (so `90m` and `5h` are errors, while `5m` and `6h` are not).
 */
export function durationToCron(duration: string): string {
	const match = /^(\d+)(s|m|h)$/.exec(duration.trim());
	if (!match) {
		throw new Error(
			`Invalid duration "${duration}". Use a whole number followed by s, m, or h (e.g. 5m, 6h).`,
		);
	}

	const value = Number(match[1]);
	const unit = match[2];

	if (value === 0) {
		throw new Error(
			`Invalid duration "${duration}". Value must be at least 1.`,
		);
	}

	if (unit === "s") {
		throw new Error(
			`Cannot schedule "${duration}": cron runs at most once per minute, so sub-minute intervals are not supported.`,
		);
	}

	if (unit === "m") {
		if (value >= MINUTES_PER_HOUR || MINUTES_PER_HOUR % value !== 0) {
			throw new Error(
				`Cannot schedule "${duration}": minute intervals must divide 60 evenly (e.g. 1, 2, 5, 10, 15, 30). For longer cadences use hours.`,
			);
		}
		return `*/${value} * * * *`;
	}

	if (value >= HOURS_PER_DAY || HOURS_PER_DAY % value !== 0) {
		throw new Error(
			`Cannot schedule "${duration}": hour intervals must divide 24 evenly (e.g. 1, 2, 3, 4, 6, 8, 12).`,
		);
	}
	return `0 */${value} * * *`;
}
