import Box from "@mui/material/Box";
import type { KeyedToolMessage } from "./groupToolRuns";
import { ToolCallRow } from "./ToolRunRow/ToolCallRow";

export function ToolRunRow({ calls }: { calls: KeyedToolMessage[] }) {
	return (
		<Box sx={{ mb: 1 }}>
			{calls.map((c) => (
				<ToolCallRow
					key={c.key}
					tool={c.tool}
					target={c.target}
					description={c.description}
				/>
			))}
		</Box>
	);
}
