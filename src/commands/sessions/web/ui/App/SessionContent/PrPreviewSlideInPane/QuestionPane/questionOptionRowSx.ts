export function questionOptionRowSx(checked: boolean) {
	return {
		display: "flex",
		alignItems: "flex-start",
		gap: 1,
		px: 1.5,
		py: 1,
		border: 1,
		borderRadius: 1,
		cursor: "pointer",
		borderColor: checked ? "primary.main" : "divider",
		bgcolor: checked ? "action.selected" : "transparent",
		"&:hover": { bgcolor: checked ? "action.selected" : "action.hover" },
	} as const;
}
