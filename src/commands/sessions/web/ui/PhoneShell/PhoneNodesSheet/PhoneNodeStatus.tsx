import Box from "@mui/material/Box";
import { sameNodeUrl } from "../../HomeNodeGate/sameNodeUrl";
import type { HomeNodeApi } from "../../HomeNodeGate/useHomeNode";
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
	homeNode,
}: {
	status: NodesSheetStatus;
	homeVersion: string | undefined;
	homeNode: HomeNodeApi;
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
						isSaved={(url) =>
							homeNode.nodes.some((n) => sameNodeUrl(n.url, url))
						}
						onSave={({ name, url }) => homeNode.saveNode("", { name, url })}
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
