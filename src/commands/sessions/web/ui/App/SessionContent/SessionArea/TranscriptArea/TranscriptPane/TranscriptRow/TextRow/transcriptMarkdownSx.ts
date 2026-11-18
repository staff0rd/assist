import type { Theme } from "@mui/material";
import { sessionTextSize } from "../../../../../../sessionTextSize";
import { sessionTypeSize } from "../../../../../../sessionTypeSize";
import { baseTranscriptMarkdownSx } from "./baseTranscriptMarkdownSx";

const headingSizes = {
	"& h1": "1.6rem",
	"& h2": "1.35rem",
	"& h3": "1.15rem",
	"& h4": "1.05rem",
	"& h5, & h6": "1rem",
};

export const transcriptMarkdownSx = (theme: Theme) => ({
	...baseTranscriptMarkdownSx(theme),
	fontSize: sessionTypeSize("body2")(theme),
	...Object.fromEntries(
		Object.entries(headingSizes).map(([selector, size]) => [
			selector,
			{ fontSize: sessionTextSize(size) },
		]),
	),
});
