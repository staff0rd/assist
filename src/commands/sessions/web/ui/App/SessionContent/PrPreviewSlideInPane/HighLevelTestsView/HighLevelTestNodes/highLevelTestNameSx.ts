import { sessionTextSize } from "../../../../sessionTextSize";

export const highLevelTestNameSx = {
	fontSize: sessionTextSize(12),
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;
