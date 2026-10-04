import CircleIcon from "@mui/icons-material/Circle";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import type { NodesState } from "../../types";
import { assistVersion } from "./assistVersion";
import { nodeStateColor } from "./NodeOptionLabel/nodeStateColor";
import { peerVersionDrift } from "./NodeOptionLabel/peerVersionDrift";
import { useDaemonVersionContext } from "./useDaemonVersionContext";

const chipSx = { height: 16, fontSize: 10 } as const;
const versionSx = { opacity: 0.6, fontSize: "0.85em" } as const;

function describeNode(nodes: NodesState, name: string): string {
	if (name === nodes.local) return "this machine";
	const link = nodes.links.find((l) => l.name === name);
	if (!link) return "";
	return link.error ? `${link.state}: ${link.error}` : link.state;
}

export function NodeOptionLabel({
	nodes,
	name,
	showVersion = false,
}: {
	nodes: NodesState;
	name: string;
	showVersion?: boolean;
}) {
	const localVersion = useDaemonVersionContext() ?? assistVersion;
	const link = nodes.links.find((l) => l.name === name);
	const drift = peerVersionDrift(link?.peerVersion, localVersion);
	return (
		<Tooltip title={describeNode(nodes, name)} placement="right">
			<Box
				component="span"
				sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
			>
				<CircleIcon sx={{ fontSize: 8, color: nodeStateColor(link?.state) }} />
				{name}
				{showVersion && link?.peerVersion && (
					<Box component="span" sx={versionSx}>
						v{link.peerVersion}
					</Box>
				)}
				{drift && (
					<Chip
						label={drift}
						size="small"
						color={drift === "behind" ? "warning" : "info"}
						sx={chipSx}
					/>
				)}
			</Box>
		</Tooltip>
	);
}
