export function tabSx(selected: boolean) {
	return {
		height: "100%",
		px: 1.25,
		gap: 0.75,
		flexShrink: 0,
		fontSize: 12,
		fontWeight: 500,
		letterSpacing: "0.04em",
		textTransform: "uppercase",
		whiteSpace: "nowrap",
		color: selected ? "primary.main" : "text.secondary",
		borderBottom: 2,
		borderColor: selected ? "primary.main" : "transparent",
		"&:hover": { color: selected ? "primary.main" : "text.primary" },
		"&.Mui-disabled": { color: "text.disabled" },
	} as const;
}
