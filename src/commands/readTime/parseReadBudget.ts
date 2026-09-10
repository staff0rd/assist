const BUDGET_PATTERN = /^(?:(\d+)m)?(?:(\d+)s)?$/;

export function parseReadBudget(value: string): number {
	const match = BUDGET_PATTERN.exec(value.trim());
	const minutes = match?.[1];
	const seconds = match?.[2];

	if (minutes === undefined && seconds === undefined) {
		throw new Error(
			`Invalid budget "${value}". Use a duration like 45s, 1m30s or 2m.`,
		);
	}

	const total = Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
	if (total === 0) {
		throw new Error(`Invalid budget "${value}". Value must be at least 1s.`);
	}

	return total;
}
