import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import type { SavedNode } from "../HomeNodeGate/SavedNode";
import { useHomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";
import { PhoneNodeEditView } from "./PhoneNodesSheet/PhoneNodeEditView";
import { PhoneNodesList } from "./PhoneNodesSheet/PhoneNodesList";
import { phoneSheetPaperSx } from "./phoneSheetPaperSx";
import type { NodesSheetStatus } from "./PhoneNodesSheet/PhoneNodeStatus";

export type NodesSheetView =
	| { kind: "list" }
	| { kind: "add" }
	| { kind: "edit"; node: SavedNode };

type Props = {
	view: NodesSheetView | null;
	onView: (view: NodesSheetView | null) => void;
	status?: NodesSheetStatus;
};

export function PhoneNodesSheet({ view, onView, status }: Props) {
	const homeNode = useHomeNodeContext();
	const [lastView, setLastView] = useState<NodesSheetView>({ kind: "list" });
	if (view && view !== lastView) setLastView(view);
	if (!homeNode) return null;

	const shown = view ?? lastView;
	const close = () => onView(null);

	return (
		<Drawer
			anchor="bottom"
			open={!!view}
			onClose={close}
			slotProps={{ paper: { sx: phoneSheetPaperSx } }}
		>
			{shown.kind === "list" ? (
				<PhoneNodesList
					homeNode={homeNode}
					status={status}
					onClose={close}
					onEdit={(node) => onView({ kind: "edit", node })}
					onAdd={() => onView({ kind: "add" })}
				/>
			) : (
				<PhoneNodeEditView
					homeNode={homeNode}
					node={shown.kind === "edit" ? shown.node : undefined}
					onDone={() => onView({ kind: "list" })}
				/>
			)}
		</Drawer>
	);
}
