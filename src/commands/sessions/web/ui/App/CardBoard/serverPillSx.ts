import type { Theme } from "@mui/material/styles";

export function serverPillSx(selected: boolean) {
	return (t: Theme) => ({
		display: "inline-flex",
		alignItems: "center",
		gap: 1,
		maxWidth: "100%",
		minWidth: 0,
		pl: 1.5,
		pr: 0.5,
		py: 0.25,
		typography: "body2",
		borderRadius: 999,
		border: 1,
		borderColor: t.tokens.color.line,
		bgcolor: t.tokens.color.surface,
		boxShadow: selected
			? `0 0 0 ${t.tokens.selection.ringWidth}px ${t.palette.primary.main}`
			: "none",
	});
}
