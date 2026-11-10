import Box from "@mui/material/Box";
import { prLaunchMeta } from "../../App/prLaunchMeta";
import { reviewTargetPr } from "../../App/reviewTargetPr";
import { usePrStatus } from "../../App/usePrStatus";
import type { AssistLaunchMeta } from "../../resumeSessionAction";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import { PhonePrModeRow } from "./PhonePrModeRow";
import { usePhonePrModes } from "./usePhonePrModes";

type Props = {
	session: SessionInfo;
	node: string | undefined;
	launchAssist: (args: string[], cwd?: string, meta?: AssistLaunchMeta) => void;
	onDone: () => void;
};

export function PhonePrActions({ session, node, launchAssist, onDone }: Props) {
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), session.status);
	const modes = usePhonePrModes(node);
	if (!pr || !session.cwd) return null;

	const meta = {
		...prLaunchMeta(pr),
		inPlace: true,
		launchedFrom: session.id,
		...(node ? { node } : {}),
	};
	return (
		<>
			<Box sx={nodeListSx.label}>Pull request #{pr.number}</Box>
			<Box sx={nodeListSx.group}>
				{modes.map((entry) => (
					<PhonePrModeRow
						key={entry.label}
						entry={entry}
						onLaunch={(args) => {
							launchAssist([...args, String(pr.number)], session.cwd, meta);
							onDone();
						}}
					/>
				))}
			</Box>
		</>
	);
}
