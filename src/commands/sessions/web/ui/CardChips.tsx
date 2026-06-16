import Chip from "@mui/material/Chip";
import { ActivityChips } from "./ActivityChips";
import { isWindowsCwd } from "./isWindowsCwd";
import { repoLabel } from "./repoLabel";
import type { SessionInfo } from "./types";
import { WindowsBadge } from "./WindowsBadge";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function CardChips({ session }: { session: SessionInfo }) {
	const repo = repoLabel(session.cwd);
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			{isWindowsCwd(session.cwd) && <WindowsBadge />}
			<ActivityChips session={session} />
		</>
	);
}
