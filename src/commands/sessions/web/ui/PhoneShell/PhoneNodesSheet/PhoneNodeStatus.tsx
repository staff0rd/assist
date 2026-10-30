import Box from "@mui/material/Box";
import type {
	HarnessRateLimits,
	RateLimits,
} from "../../../../../../shared/RateLimits";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { NodesState, SessionInfo } from "../../types";
import { PhoneLinkedNodes } from "./PhoneLinkedNodes";
import { PhoneRateLimits } from "./PhoneRateLimits";

export type NodesSheetStatus = {
	nodes: NodesState | null;
	sessions: SessionInfo[];
	rateLimits: RateLimits | null;
	harnessRateLimits: HarnessRateLimits;
};

export function PhoneNodeStatus({
	status,
	homeVersion,
}: {
	status: NodesSheetStatus;
	homeVersion: string | undefined;
}) {
	const links = status.nodes?.links ?? [];
	return (
		<>
			{links.length > 0 && (
				<>
					<Box sx={nodeListSx.label}>Linked through {status.nodes?.local}</Box>
					<PhoneLinkedNodes
						links={links}
						sessions={status.sessions}
						homeVersion={homeVersion}
					/>
				</>
			)}
			<PhoneRateLimits
				rateLimits={status.rateLimits}
				harnessRateLimits={status.harnessRateLimits}
			/>
		</>
	);
}
