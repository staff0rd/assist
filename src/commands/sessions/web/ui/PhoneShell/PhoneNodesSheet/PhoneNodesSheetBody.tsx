import type { HomeNodeApi } from "../../HomeNodeGate/useHomeNode";
import type { NodesSheetView } from "../PhoneNodesSheet";
import type { PhoneNodeUpdates } from "../PhoneNodeUpdates/usePhoneNodeUpdates";
import { PhoneNodeEditView } from "./PhoneNodeEditView";
import { PhoneNodesList } from "./PhoneNodesList";
import type { NodesSheetStatus } from "./PhoneNodeStatus";
import { PhoneNodeUpdateView } from "./PhoneNodeUpdateView";

type Props = {
	homeNode: HomeNodeApi;
	shown: NodesSheetView;
	onView: (view: NodesSheetView | null) => void;
	status: NodesSheetStatus | undefined;
	updates: PhoneNodeUpdates | undefined;
};

export function PhoneNodesSheetBody({
	homeNode,
	shown,
	onView,
	status,
	updates,
}: Props) {
	const toList = () => onView({ kind: "list" });
	if (shown.kind === "update" && updates)
		return (
			<PhoneNodeUpdateView
				name={shown.name}
				updates={updates}
				onBack={toList}
			/>
		);
	if (shown.kind === "add" || shown.kind === "edit")
		return (
			<PhoneNodeEditView
				homeNode={homeNode}
				node={shown.kind === "edit" ? shown.node : undefined}
				onDone={toList}
			/>
		);
	return (
		<PhoneNodesList
			homeNode={homeNode}
			status={status}
			updates={updates}
			onClose={() => onView(null)}
			onEdit={(node) => onView({ kind: "edit", node })}
			onAdd={() => onView({ kind: "add" })}
			onOpenUpdate={(name) => onView({ kind: "update", name })}
		/>
	);
}
