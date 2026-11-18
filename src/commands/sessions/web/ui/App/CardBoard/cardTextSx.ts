export const cardTextSx = {
	head: { display: "flex", alignItems: "center", gap: 1 },
	title: {
		fontSize: "h6.fontSize",
		fontWeight: 600,
		lineHeight: 1.4,
		overflowWrap: "anywhere",
	},
	compactTitle: {
		typography: "body2",
		fontWeight: 600,
		lineHeight: 1.4,
		overflowWrap: "anywhere",
	},
	age: {
		ml: "auto",
		typography: "caption",
		color: "text.secondary",
		whiteSpace: "nowrap",
	},
} as const;
