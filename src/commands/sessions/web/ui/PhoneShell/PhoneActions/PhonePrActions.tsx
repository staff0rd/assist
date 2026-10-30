import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Box from "@mui/material/Box";
import { reviewButtonModes } from "../../../../../../shared/reviewButtonModes";
import { prLaunchMeta } from "../../App/prLaunchMeta";
import { reviewTargetPr } from "../../App/reviewTargetPr";
import { usePrStatus } from "../../App/usePrStatus";
import type { AssistLaunchMeta } from "../../createSessionAction";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import { PhoneSheetItem } from "./PhoneSheetItem";

const prModes = [
	...reviewButtonModes.filter((mode) => !mode.args.includes("--high-level")),
	{ label: "Address comments", args: ["review-pr-comments"] },
];

type Props = {
	session: SessionInfo;
	node: string | undefined;
	launchAssist: (args: string[], cwd?: string, meta?: AssistLaunchMeta) => void;
	onDone: () => void;
};

export function PhonePrActions({ session, node, launchAssist, onDone }: Props) {
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), session.status);
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
				{prModes.map((mode) => (
					<PhoneSheetItem
						key={mode.label}
						label={mode.label}
						icon={<RateReviewOutlinedIcon fontSize="small" />}
						onClick={() => {
							launchAssist(
								[...mode.args, String(pr.number)],
								session.cwd,
								meta,
							);
							onDone();
						}}
					/>
				))}
			</Box>
		</>
	);
}
