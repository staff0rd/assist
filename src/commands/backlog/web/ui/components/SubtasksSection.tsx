import { Alert, Box, Stack, Typography } from "@mui/material";
import type { Subtask, SubtaskStatus } from "../types";
import { SubtaskRow } from "./SubtaskRow";

const headingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function SubtasksSection({
	subtasks,
	onStatusChange,
}: {
	subtasks: Subtask[];
	onStatusChange: (idx: number, status: SubtaskStatus) => void;
}) {
	if (subtasks.length === 0) return null;
	const incomplete = subtasks.filter((s) => s.status !== "done").length;
	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="overline" sx={headingSx}>
				Sub-tasks
			</Typography>
			<Stack spacing={1}>
				{subtasks.map((s, i) => (
					<SubtaskRow
						key={`${s.title}-${i}`}
						subtask={s}
						onStatusChange={(status) => onStatusChange(i, status)}
					/>
				))}
			</Stack>
			{incomplete > 0 && (
				<Alert severity="warning" sx={{ mt: 1 }}>
					{incomplete} sub-task{incomplete === 1 ? "" : "s"} not yet done.
				</Alert>
			)}
		</Box>
	);
}
