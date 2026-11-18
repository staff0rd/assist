export function boardColumnSx(narrow: boolean) {
	return {
		flex: narrow ? "0 0 380px" : 1,
		minWidth: 0,
		overflow: "auto",
		px: narrow ? 2.5 : 4,
		py: 3.5,
		display: "flex",
		flexDirection: "column",
		gap: 4,
		bgcolor: "background.default",
	} as const;
}
