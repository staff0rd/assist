import Box from "@mui/material/Box";
import type { LinkStatus } from "../../../../daemon/links/LinkStatus";
import { NodeDot } from "../../HomeNodeGate/NodeDot";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import { linkDetail } from "./linkDetail";
import { linkStateTone } from "./linkStateTone";

const driftBadgeSx = {
	fontFamily: "fontFamilyMono",
	fontSize: 12,
	px: 0.75,
	border: 1,
	borderColor: "currentColor",
	borderRadius: "4px",
	color: "warning.main",
} as const;

type Props = {
	links: LinkStatus[];
	sessions: SessionInfo[];
	homeVersion: string | undefined;
};

export function PhoneLinkedNodes({ links, sessions, homeVersion }: Props) {
	return (
		<Box sx={nodeListSx.group}>
			{links.map((link) => {
				const { text, drift } = linkDetail(link, sessions, homeVersion);
				return (
					<Box key={link.name} sx={nodeListSx.item}>
						<NodeDot tone={linkStateTone[link.state]} />
						<Box component="span" sx={nodeListSx.grow}>
							{link.name}
							<Box component="span" sx={nodeListSx.detail}>
								{text}
							</Box>
						</Box>
						{drift && (
							<Box component="span" sx={driftBadgeSx}>
								{drift}
							</Box>
						)}
					</Box>
				);
			})}
		</Box>
	);
}
