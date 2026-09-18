import { Box, Stack, TextField, Typography } from "@mui/material";
import type { HighLevelCheckResult } from "../../../review/highLevel/types";
import { HighLevelCheckMarker } from "./HighLevelCheckMarker";
import { highLevelItemSx } from "./highLevelItemSx";

export function HighLevelCheckItem({
	check,
	ticked,
	comment,
	onTick,
	onComment,
}: {
	check: HighLevelCheckResult;
	ticked: boolean;
	comment: string;
	onTick: (ticked: boolean) => void;
	onComment: (comment: string) => void;
}) {
	const failed = check.status === "fail";
	return (
		<Box sx={highLevelItemSx(failed)}>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
				<HighLevelCheckMarker check={check} ticked={ticked} onTick={onTick} />
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="body2"
						sx={{ fontWeight: 600, color: failed ? "error.main" : undefined }}
					>
						{check.title}
					</Typography>
					<Typography
						variant="caption"
						sx={{
							display: "block",
							color: failed ? "error.main" : "text.secondary",
						}}
					>
						{failed ? `Fails: ${check.reason}` : check.reason}
					</Typography>
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
				</Box>
			</Stack>
		</Box>
	);
}
