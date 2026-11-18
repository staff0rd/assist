import Box from "@mui/material/Box";
import { PortLink } from "../AppSidebar/PortLink";
import { hasEnded } from "../SessionContent/SessionArea/TerminalArea/TerminalPanes/hasEnded";
import type { SessionInfo } from "../../types";
import { ServerPillAction } from "./ServerPillAction";
import { ServerPillName } from "./ServerPillName";
import { serverPillSx } from "./serverPillSx";

export function ServerPill({
	session,
	selected,
	onOpen,
}: {
	session: SessionInfo;
	selected: boolean;
	onOpen: () => void;
}) {
	const ended = hasEnded(session.status);
	return (
		<Box data-testid="server-pill" sx={serverPillSx(selected)}>
			<ServerPillName
				name={session.runName ?? session.name}
				ended={ended}
				selected={selected}
				onOpen={onOpen}
			/>
			{session.port && !ended ? (
				<Box
					component="span"
					sx={{ typography: "caption", fontFamily: "fontFamilyMono" }}
				>
					<PortLink
						port={session.port}
						node={session.node}
						protocol={session.protocol}
						urlPath={session.urlPath}
					/>
				</Box>
			) : null}
			<ServerPillAction session={session} />
		</Box>
	);
}
