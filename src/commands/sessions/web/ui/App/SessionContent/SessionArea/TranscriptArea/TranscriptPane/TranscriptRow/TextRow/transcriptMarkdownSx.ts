import type { Theme } from "@mui/material";
import { sessionTypeSize } from "../../../../../../sessionTypeSize";
import { baseTranscriptMarkdownSx } from "./baseTranscriptMarkdownSx";
import { transcriptHeadingSx } from "./transcriptHeadingSx";

export const transcriptMarkdownSx = (theme: Theme) => ({
	...baseTranscriptMarkdownSx(theme),
	fontSize: sessionTypeSize("body2")(theme),
	...transcriptHeadingSx,
});
