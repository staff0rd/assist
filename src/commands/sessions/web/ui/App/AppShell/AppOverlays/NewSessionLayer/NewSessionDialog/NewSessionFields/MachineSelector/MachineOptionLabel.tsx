import CloudDownloadIcon from "@mui/icons-material/CloudDownloadOutlined";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { NodesState } from "../../../../../../../types";
import type { NodeClone } from "../../../../../../../useNodeClones";
import { NodeOptionLabel } from "../../../../../NodeOptionLabel";
import { cloneTooltip } from "../../../../../../../../../../backlog/web/ui/components/cloneTooltip";

const uncloned = { opacity: 0.6 } as const;
const clonableSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.5,
	px: 0.5,
	border: 1,
	borderStyle: "dashed",
	borderRadius: 1,
} as const;

export function MachineOptionLabel({
	nodes,
	name,
	clone,
}: {
	nodes: NodesState;
	name: string;
	clone: NodeClone;
}) {
	const label = <NodeOptionLabel nodes={nodes} name={name} />;
	if (clone.kind === "cloned") return label;
	if (clone.kind === "unavailable")
		return (
			<Box component="span" sx={uncloned}>
				{label}
			</Box>
		);
	return (
		<Tooltip title={cloneTooltip(name, clone.cloneTarget)}>
			<Box component="span" sx={clonableSx}>
				<CloudDownloadIcon sx={{ fontSize: 14 }} />
				{label}
			</Box>
		</Tooltip>
	);
}
