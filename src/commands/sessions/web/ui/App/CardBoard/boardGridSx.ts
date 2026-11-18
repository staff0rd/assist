export function boardGridSx(compact: boolean) {
	return {
		display: "grid",
		gridTemplateColumns: compact
			? "minmax(0, 1fr)"
			: "repeat(auto-fill, minmax(320px, 1fr))",
		gap: compact ? 1.25 : 2.5,
	} as const;
}
