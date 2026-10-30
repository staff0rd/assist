import { Box, Stack, Typography } from "@mui/material";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { NodeForm } from "./NodeForm";
import { type NodeHealth, probeHealth } from "./probeHealth";
import type { SavedNode } from "./SavedNode";

type Props = { onConnect: (node: SavedNode, health: NodeHealth) => void };

const screenSx = {
	height: "100%",
	boxSizing: "border-box",
	overflowY: "auto",
	display: "flex",
	justifyContent: "center",
	pt: `calc(${safeAreaInsets.top} + 28px)`,
	pb: `calc(${safeAreaInsets.bottom} + 24px)`,
	px: 2.5,
	bgcolor: "background.default",
} as const;

const markSx = {
	width: 56,
	height: 56,
	borderRadius: "14px",
	bgcolor: "action.hover",
	border: 1,
	borderColor: "divider",
	display: "grid",
	placeItems: "center",
	fontFamily: "fontFamilyMono",
	fontSize: 22,
	fontWeight: 600,
	color: "primary.main",
} as const;

export function HomeNodeSetup({ onConnect }: Props) {
	const connect = async (node: SavedNode) => {
		const result = await probeHealth(node.url);
		if (!result.ok) return `Can't reach ${node.url}: ${result.error}`;
		onConnect(node, result.health);
		return undefined;
	};

	return (
		<Box sx={screenSx}>
			<Stack spacing={2.5} sx={{ width: "100%", maxWidth: 420 }}>
				<Box sx={markSx}>&gt;_</Box>
				<Typography variant="h5" sx={{ fontWeight: 700 }}>
					Connect to a home node
				</Typography>
				<Typography variant="body2" color="text.secondary">
					The phone connects to one assist web server over Tailscale. You'll see
					its sessions and the sessions of every node it links to. Make sure
					Tailscale is connected on this phone and{" "}
					<code>assist sessions web</code> is running on that machine.
				</Typography>
				<NodeForm submitLabel="Connect" onSubmit={connect} />
			</Stack>
		</Box>
	);
}
