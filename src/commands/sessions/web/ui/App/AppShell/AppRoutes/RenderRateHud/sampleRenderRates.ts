type RenderRate = {
	label: string;
	total: number;
	perSecond: number;
};

export function sampleRenderRates(
	counts: Map<string, number>,
	previous: Map<string, number>,
	elapsedMs: number,
): RenderRate[] {
	const rates: RenderRate[] = [];
	for (const [label, total] of counts) {
		const delta = total - (previous.get(label) ?? 0);
		rates.push({
			label,
			total,
			perSecond: elapsedMs > 0 ? (delta * 1000) / elapsedMs : 0,
		});
	}
	return rates.sort((a, b) => b.perSecond - a.perSecond || b.total - a.total);
}

export function formatRenderRates(rates: RenderRate[]): string {
	if (rates.length === 0) return "no renders since reset";
	const width = Math.max(...rates.map((rate) => rate.label.length));
	const lines = rates.map(
		(rate) =>
			`${rate.label.padEnd(width)} ${rate.perSecond.toFixed(0).padStart(4)}/s ${String(rate.total).padStart(6)}`,
	);
	return ["renders/s  total (click to copy)", ...lines].join("\n");
}
