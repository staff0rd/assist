import type { SavedNode } from "../../HomeNodeGate/SavedNode";
import type { HomeNodeApi } from "../../HomeNodeGate/useHomeNode";
import { PhoneNodeEditor } from "./PhoneNodeEditor";
import { PhoneSheetHeader } from "./PhoneSheetHeader";

type Props = {
	homeNode: HomeNodeApi;
	node: SavedNode | undefined;
	onDone: () => void;
};

export function PhoneNodeEditView({ homeNode, node, onDone }: Props) {
	return (
		<>
			<PhoneSheetHeader
				title={node ? "Edit node" : "Add node"}
				actionLabel="Cancel"
				onAction={onDone}
			/>
			<PhoneNodeEditor
				key={node?.url ?? "add"}
				homeNode={homeNode}
				node={node}
				onDone={onDone}
			/>
		</>
	);
}
