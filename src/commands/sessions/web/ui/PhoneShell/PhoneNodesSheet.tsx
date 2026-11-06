import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import { TestflightTestersDialog } from "../App/AppShell/HamburgerMenu/HamburgerMenuDialogs/TestflightTestersDialog";
import type { SavedNode } from "../HomeNodeGate/SavedNode";
import { useHomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";
import type { PhoneNodeUpdates } from "./PhoneNodeUpdates/usePhoneNodeUpdates";
import { PhoneNodesSheetBody } from "./PhoneNodesSheet/PhoneNodesSheetBody";
import { phoneSheetPaperSx } from "./phoneSheetPaperSx";
import type { NodesSheetStatus } from "./PhoneNodesSheet/PhoneNodeStatus";

export type NodesSheetView =
	| { kind: "list" }
	| { kind: "add" }
	| { kind: "edit"; node: SavedNode }
	| { kind: "update"; name: string }
	| { kind: "testflight" };

type Props = {
	view: NodesSheetView | null;
	onView: (view: NodesSheetView | null) => void;
	status?: NodesSheetStatus;
	updates?: PhoneNodeUpdates;
};

export function PhoneNodesSheet({ view, onView, status, updates }: Props) {
	const homeNode = useHomeNodeContext();
	const [lastView, setLastView] = useState<NodesSheetView>({ kind: "list" });
	const drawerView = view?.kind === "testflight" ? null : view;
	if (drawerView && drawerView !== lastView) setLastView(drawerView);
	if (!homeNode) return null;

	return (
		<>
			<Drawer
				anchor="bottom"
				open={!!drawerView}
				onClose={() => onView(null)}
				slotProps={{ paper: { sx: phoneSheetPaperSx } }}
			>
				<PhoneNodesSheetBody
					homeNode={homeNode}
					shown={drawerView ?? lastView}
					onView={onView}
					status={status}
					updates={updates}
				/>
			</Drawer>
			{view?.kind === "testflight" && (
				<TestflightTestersDialog fullScreen onClose={() => onView(null)} />
			)}
		</>
	);
}
