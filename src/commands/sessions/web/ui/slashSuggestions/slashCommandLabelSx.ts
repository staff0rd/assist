export const slashCommandLabelSx = {
	name: {
		fontFamily: "fontFamilyMono",
		typography: "body1",
		color: "text.primary",
	},
	match: { color: "primary.main", fontWeight: 500 },
	scope: {
		ml: 0.75,
		typography: "caption",
		color: "text.secondary",
		textTransform: "uppercase",
		letterSpacing: "0.04em",
	},
	description: {
		typography: "body2",
		color: "text.secondary",
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
} as const;
