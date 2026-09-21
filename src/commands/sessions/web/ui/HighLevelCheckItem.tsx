import { Box, Stack, TextField } from "@mui/material";
import type { ReactNode } from "react";
import type { HighLevelCheckResult } from "../../../review/highLevel/types";
import { HighLevelCheckMarker } from "./HighLevelCheckMarker";
import { HighLevelCheckText } from "./HighLevelCheckText";
import { highLevelItemSx } from "./highLevelItemSx";

export function HighLevelCheckItem({
	check,
	ticked,
	comment,
	detail,
	onTick,
	onComment,
}: {
	check: HighLevelCheckResult;
	ticked: boolean;
	comment: string;
	detail?: ReactNode;
	onTick: (ticked: boolean) => void;
	onComment: (comment: string) => void;
}) {
	const failed = check.status === "fail";
	return (
		<Box sx={highLevelItemSx(failed)}>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
				<HighLevelCheckMarker check={check} ticked={ticked} onTick={onTick} />
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<HighLevelCheckText check={check} failed={failed} />
					<TextField
						variant="standard"
						size="small"
						fullWidth
						multiline
						value={comment}
						onChange={(e) => onComment(e.target.value)}
						placeholder="Comment (optional)"
						slotProps={{
							htmlInput: { "aria-label": `Comment on ${check.title}` },
						}}
						sx={{ mt: 0.5, "& .MuiInputBase-input": { fontSize: 12 } }}
					/>
					{detail}
				</Box>
			</Stack>
		</Box>
	);
}
