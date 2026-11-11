export function splitContainerSx(stacked: boolean) {
	return {
		display: "flex",
		flexDirection: stacked ? "column" : "row",
		flex: 1,
		minHeight: 0,
		position: "relative",
		overflow: "hidden",
	} as const;
}
