import { Box, Stack, Typography } from "@mui/material";
import type { Subtask, SubtaskStatus } from "../types";
import { MarkdownBlock } from "./MarkdownBlock";
import { SubtaskStatusPicker } from "./SubtaskStatusPicker";

export function SubtaskRow({
	subtask,
	onStatusChange,
}: {
	subtask: Subtask;
	onStatusChange: (status: SubtaskStatus) => void;
}) {
	const done = subtask.status === "done";
	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
		>
			<Box sx={{ flex: 1 }}>
				<Typography
					variant="body2"
					sx={{
						textDecoration: done ? "line-through" : "none",
						color: done ? "text.disabled" : "text.primary",
					}}
				>
					{subtask.title}
				</Typography>
				{subtask.description && (
					<Box
						sx={{
							mt: 0.5,
							fontSize: "0.8125rem",
							color: done ? "text.disabled" : "text.secondary",
						}}
					>
						<MarkdownBlock content={subtask.description} />
					</Box>
				)}
			</Box>
			<SubtaskStatusPicker
				current={subtask.status}
				onStatusChange={onStatusChange}
			/>
		</Stack>
	);
}
