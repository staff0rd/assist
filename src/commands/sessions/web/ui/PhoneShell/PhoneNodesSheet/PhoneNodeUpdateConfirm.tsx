import Box from "@mui/material/Box";
import { restartLabel } from "../../App/AppShell/AppRoutes/UpdatesView/restartLabel";
import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import { PhoneSheetButton } from "../PhoneSheetButton";
import { phoneUpdateNoteSx } from "./phoneUpdateNoteSx";

export type UpdateConfirm = "update" | "restart";

function confirmText(entry: NodeUpdateEntry, confirm: UpdateConfirm): string {
	if (confirm === "update")
		return `Runs assist update on ${entry.name}, then restarts its daemon and web server.`;
	const what = entry.status?.restart.map(restartLabel).join(" and ") ?? "";
	return `Restarts the ${what} on ${entry.name} to run v${entry.status?.built}.`;
}

type Props = {
	entry: NodeUpdateEntry;
	confirm: UpdateConfirm;
	onConfirm: () => void;
	onCancel: () => void;
};

export function PhoneNodeUpdateConfirm({
	entry,
	confirm,
	onConfirm,
	onCancel,
}: Props) {
	return (
		<>
			<Box sx={phoneUpdateNoteSx}>{confirmText(entry, confirm)}</Box>
			<PhoneSheetButton onClick={onConfirm}>
				{confirm === "update"
					? `Update ${entry.name}`
					: `Restart ${entry.name}`}
			</PhoneSheetButton>
			<PhoneSheetButton variant="outlined" onClick={onCancel}>
				Cancel
			</PhoneSheetButton>
		</>
	);
}
