import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { ExpandButton } from "./NodeUpdateRow/ExpandButton";
import { NodeUpdateDetail } from "./NodeUpdateRow/NodeUpdateDetail";
import { nodeUpdateRowSx } from "./NodeUpdateRow/nodeUpdateRowSx";
import { UpdateStateChip } from "./NodeUpdateRow/UpdateStateChip";
import { Versions } from "./NodeUpdateRow/Versions";
import { updateState } from "./updateState";

const stackSx = {
	display: "flex",
	flexDirection: "column",
	minWidth: 0,
} as const;

export function NodeUpdateRow({ entry }: { entry: NodeUpdateEntry }) {
	const [open, setOpen] = useState(false);
	const state = updateState(entry);
	const where = entry.local ? "this machine" : "linked";
	return (
		<Box
			component="article"
			sx={{ "& + &": { borderTop: 1, borderColor: "divider" } }}
		>
			<Box sx={nodeUpdateRowSx(state.kind)}>
				<ExpandButton
					open={open}
					label={`${open ? "Hide" : "Show"} history for ${entry.name}`}
					onToggle={() => setOpen((o) => !o)}
				/>
				<Box sx={stackSx}>
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{entry.name}
					</Typography>
					<Typography variant="caption" color="text.secondary" noWrap>
						{entry.status ? `${where} · ${entry.status.installDir}` : where}
					</Typography>
				</Box>
				<Versions entry={entry} />
				<Box
					sx={{ ...stackSx, gridColumn: { xs: "2", sm: "auto" }, gap: 0.25 }}
				>
					<UpdateStateChip state={state} />
					<Typography variant="caption" color="text.secondary" noWrap>
						{state.line}
					</Typography>
				</Box>
			</Box>
			{open && <NodeUpdateDetail entry={entry} state={state} />}
		</Box>
	);
}
