import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import type { LinkStatus } from "../../../../../../../daemon/links/LinkStatus";
import { nodeDetailSx } from "../nodeRowSx";

function protocolLine(link: LinkStatus): string {
	if (link.peerProtocol === undefined || link.protocol === undefined)
		return "This node and the peer run different link protocols.";
	return link.peerProtocol < link.protocol
		? "Peer runs an older link protocol."
		: "Peer runs a newer link protocol than this node.";
}

export function LinkDetail({ link }: { link: LinkStatus }) {
	if (link.state === "version-blocked")
		return (
			<Typography variant="caption" color="warning.main" sx={nodeDetailSx}>
				{protocolLine(link)} Update from the{" "}
				<Link component={RouterLink} to="/updates" color="inherit">
					Updates page
				</Link>
				.
			</Typography>
		);
	if (link.state === "disconnected" && link.error)
		return (
			<Typography
				variant="caption"
				color="error"
				sx={{
					...nodeDetailSx,
					fontFamily: "fontFamilyMono",
					overflowWrap: "anywhere",
				}}
			>
				{link.error}
			</Typography>
		);
	return null;
}
