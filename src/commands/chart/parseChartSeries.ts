type ChartPoint = { label: string; value: number };

export function parseChartSeries(lines: string[]): ChartPoint[] {
	const points: ChartPoint[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed === "") continue;

		const parts = trimmed.split(/[,\t ]+/).filter((part) => part !== "");
		if (parts.length < 2) {
			throw new Error(`Expected a label and a value, got: ${trimmed}`);
		}

		const label = parts.slice(0, -1).join(" ");
		const raw = parts[parts.length - 1];
		const value = Number(raw);
		if (!Number.isFinite(value)) {
			throw new Error(`Value "${raw}" is not numeric, on line: ${trimmed}`);
		}

		points.push({ label, value });
	}

	return points;
}
