import { sessionTypeSize } from "../sessionTypeSize";

export const cardTextSx = {
	head: { display: "flex", alignItems: "center", gap: 1 },
	title: {
		fontSize: sessionTypeSize("h6"),
		fontWeight: 600,
		lineHeight: 1.4,
		overflowWrap: "anywhere",
	},
} as const;
