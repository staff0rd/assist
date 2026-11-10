import Typography from "@mui/material/Typography";
import type { FileData } from "react-diff-view";
import { hunklessNoticeText } from "./hunklessNoticeText";

export function HunklessNotice({ file }: { file: FileData }) {
	return (
		<Typography
			variant="body2"
			color="text.secondary"
			sx={{ fontFamily: "fontFamilyMono", py: 1, overflowWrap: "anywhere" }}
		>
			{hunklessNoticeText(file)}
		</Typography>
	);
}
