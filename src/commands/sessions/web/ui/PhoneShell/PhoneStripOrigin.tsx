import Box from "@mui/material/Box";
import { repoLabel } from "../App/repoLabel";
import { tokenBadgeSx } from "../designSystem/tokenBadgeSx";
import type { SessionInfo } from "../types";

export function PhoneStripOrigin({
	session,
	localNode,
}: {
	session: SessionInfo;
	localNode: string | undefined;
}) {
	const repo = repoLabel(session.cwd);
	const node = session.node ?? localNode;
	return (
		<>
			{repo && <span data-testid="strip-repo">{repo}</span>}
			{node && (
				<Box
					component="span"
					sx={tokenBadgeSx("neutral")}
					data-testid="strip-node"
				>
					{node}
				</Box>
			)}
		</>
	);
}
