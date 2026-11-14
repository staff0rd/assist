import Box from "@mui/material/Box";
import type { ReactElement } from "react";
import { FileList } from "./FileList";
import type { ToolRunSummary } from "./summariseToolRun";

export function ToolRunSummaryText({ summary }: { summary: ToolRunSummary }) {
	const { count, edited, read, tools } = summary;
	const parts: ReactElement[] = [
		<Box key="count" component="span" sx={{ color: "text.primary" }}>
			{`${count} ${count === 1 ? "tool call" : "tool calls"}`}
		</Box>,
	];
	if (edited.length > 0)
		parts.push(
			<FileList
				key="edited"
				label="EDITED"
				color="warning.main"
				paths={edited}
			/>,
		);
	if (read.length > 0)
		parts.push(
			<FileList key="read" label="READ" color="text.secondary" paths={read} />,
		);
	if (tools)
		parts.push(
			<Box key="tools" component="span" sx={{ fontFamily: "fontFamilyMono" }}>
				{tools}
			</Box>,
		);
	return (
		<Box
			component="span"
			sx={{ display: "flex", flexWrap: "wrap", columnGap: 0.5 }}
		>
			{parts.flatMap((part, i) =>
				i === 0
					? [part]
					: [
							<Box
								key={`${part.key}-sep`}
								component="span"
								sx={{ color: "text.disabled" }}
							>
								·
							</Box>,
							part,
						],
			)}
		</Box>
	);
}
