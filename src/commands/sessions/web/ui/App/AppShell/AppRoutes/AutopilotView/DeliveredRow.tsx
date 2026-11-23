import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { deliveredLine } from "./deliveredLine";
import { deliveredPill } from "./deliveredPill";
import { diffSize } from "./diffSize";
import { ItemTitle } from "./ItemTitle";
import { itemRowSx } from "./itemRowSx";

export function DeliveredRow({
	item,
	cwd,
	busy,
	onResume,
}: {
	item: AutopilotItemView;
	cwd: string;
	busy: boolean;
	onResume: () => void;
}) {
	const stalled = item.status !== "done" && item.status !== "wontdo";
	const pill = deliveredPill(item);
	return (
		<Box sx={itemRowSx.row}>
			<ItemTitle
				item={item}
				cwd={cwd}
				pill={pill.label}
				pillColor={pill.color}
			/>
			<Box sx={itemRowSx.line}>{deliveredLine(item)}</Box>
			<Box sx={itemRowSx.side}>
				<Box
					component="span"
					sx={[itemRowSx.mono, { color: "text.secondary" }]}
				>
					{diffSize(item)}
				</Box>
				{stalled && (
					<Button
						variant="contained"
						size="small"
						disabled={busy}
						onClick={onResume}
					>
						Resume
					</Button>
				)}
			</Box>
			{item.result && (
				<Box sx={itemRowSx.next}>
					<Box component="span" sx={itemRowSx.key}>
						result
					</Box>
					{item.result}
				</Box>
			)}
		</Box>
	);
}
