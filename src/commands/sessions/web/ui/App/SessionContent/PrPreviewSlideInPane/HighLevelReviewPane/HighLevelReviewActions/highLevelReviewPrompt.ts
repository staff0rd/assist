export function highLevelReviewPrompt(
	failed: number,
	outstanding: number,
): string {
	const parts = [
		...(failed > 0
			? [`${failed} deterministic check${failed === 1 ? "" : "s"} failing`]
			: []),
		...(outstanding > 0
			? [
					`${outstanding} manual item${outstanding === 1 ? "" : "s"} left to tick`,
				]
			: []),
	];
	return parts.length > 0 ? parts.join(" · ") : "Every item is accounted for";
}
