import Box from "@mui/material/Box";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SavedNode } from "../../HomeNodeGate/SavedNode";
import type { HomeNodeApi } from "../../HomeNodeGate/useHomeNode";
import { type NodesSheetStatus, PhoneNodeStatus } from "./PhoneNodeStatus";
import { PhoneSavedNodes } from "./PhoneSavedNodes";
import { PhoneSheetHeader } from "./PhoneSheetHeader";
import { PhoneVersions } from "./PhoneVersions";

type Props = {
	homeNode: HomeNodeApi;
	status: NodesSheetStatus | undefined;
	onClose: () => void;
	onEdit: (node: SavedNode) => void;
	onAdd: () => void;
};

export function PhoneNodesList({
	homeNode,
	status,
	onClose,
	onEdit,
	onAdd,
}: Props) {
	const { connection } = homeNode;
	const homeVersion =
		connection.kind === "connected" ? connection.health.version : undefined;

	return (
		<>
			<PhoneSheetHeader title="Nodes" actionLabel="Done" onAction={onClose} />
			<Box sx={[nodeListSx.label, { pt: 0.25 }]}>Home node</Box>
			<PhoneSavedNodes
				homeNode={homeNode}
				onChoose={(url) => {
					homeNode.choose(url);
					onClose();
				}}
				onEdit={onEdit}
				onAdd={onAdd}
			/>
			{status && <PhoneNodeStatus status={status} homeVersion={homeVersion} />}
			<PhoneVersions
				homeName={homeNode.home?.name ?? "Home node"}
				homeVersion={homeVersion}
			/>
		</>
	);
}
