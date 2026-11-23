import Box from "@mui/material/Box";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { deliveredLine } from "./deliveredLine";
import { deliveredPill } from "./deliveredPill";
import { diffSize } from "./diffSize";
import { ItemTitle } from "./ItemTitle";
import { itemRowSx } from "./itemRowSx";

export function DeliveredRow({
	item,
	cwd,
}: {
	item: AutopilotItemView;
	cwd: string;
}) {
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
