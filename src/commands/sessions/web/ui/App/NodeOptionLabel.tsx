import CircleIcon from "@mui/icons-material/Circle";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { NodesState } from "../types";
import { nodeStateColor } from "./nodeStateColor";

function describeNode(nodes: NodesState, name: string): string {
	if (name === nodes.local) return "this machine";
	const link = nodes.links.find((l) => l.name === name);
	if (!link) return "";
	return link.error ? `${link.state}: ${link.error}` : link.state;
}

export function NodeOptionLabel({
	nodes,
	name,
}: {
	nodes: NodesState;
	name: string;
}) {
	const state = nodes.links.find((l) => l.name === name)?.state;
	return (
		<Tooltip title={describeNode(nodes, name)} placement="right">
			<Box
				component="span"
				sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
			>
				<CircleIcon sx={{ fontSize: 8, color: nodeStateColor(state) }} />
				{name}
			</Box>
		</Tooltip>
	);
}
