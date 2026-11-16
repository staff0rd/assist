import Box from "@mui/material/Box";
import { repoLabel } from "../App/repoLabel";
import { TransferCaption } from "../transfer/TransferCaption";
import type { transferIndicator } from "../transfer/transferIndicator";
import type { SessionInfo } from "../types";
import { PhoneBadges } from "./PhoneBadges";
import { phaseLabel } from "./phaseLabel";
import { phoneRowMetaSx } from "./phoneRowSx";

export function PhoneRowMeta({
	session,
	localNode,
	hideRepo,
	transfer,
}: {
	session: SessionInfo;
	localNode: string | undefined;
	hideRepo?: boolean;
	transfer: ReturnType<typeof transferIndicator>;
}) {
	const repo = hideRepo ? "" : repoLabel(session.cwd);
	const phase = phaseLabel(session);
	return (
		<Box sx={phoneRowMetaSx}>
			{repo && <span>{repo}</span>}
			{phase && <span>{phase}</span>}
			{transfer && <TransferCaption {...transfer} />}
			<PhoneBadges session={session} localNode={localNode} />
		</Box>
	);
}
