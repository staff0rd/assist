import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import type { KeyedToolMessage } from "./groupToolRuns";
import { summariseToolRun } from "./ToolRunRow/summariseToolRun";
import { ToolCallRow } from "./ToolRunRow/ToolCallRow";
import { ToolRunSummaryText } from "./ToolRunRow/ToolRunSummaryText";

const summarySx = {
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	width: "100%",
	justifyContent: "flex-start",
	py: 0.5,
	pl: 0.5,
	borderRadius: 1,
	typography: "caption",
	color: "text.secondary",
	textAlign: "left",
	"&:hover": { bgcolor: "action.hover" },
	"&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main" },
} as const;

export function ToolRunRow({ calls }: { calls: KeyedToolMessage[] }) {
	const [expanded, setExpanded] = useState(false);
	return (
		<Box sx={{ mb: 1 }}>
			<ButtonBase
				data-preview-skip
				aria-expanded={expanded}
				onClick={() => setExpanded((e) => !e)}
				sx={summarySx}
			>
				<ChevronRightIcon
					sx={{
						fontSize: 16,
						color: "text.disabled",
						transform: expanded ? "rotate(90deg)" : "none",
					}}
				/>
				<ToolRunSummaryText summary={summariseToolRun(calls)} />
			</ButtonBase>
			{expanded && (
				<Box sx={{ ml: 1.75, pl: 0.5, borderLeft: 1, borderColor: "divider" }}>
					{calls.map((c) => (
						<ToolCallRow
							key={c.key}
							tool={c.tool}
							target={c.target}
							description={c.description}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}
