import Box from "@mui/material/Box";
import { formatItemId } from "../../../../../backlog/formatItemId";
import { useMarkItemDone } from "../../App/SessionContent/SessionActionButtons/useMarkItemDone";
import type { BacklogTarget } from "../../backlogTarget";
import { PhoneSheetButton } from "../PhoneSheetButton";

type Props = {
	target: BacklogTarget;
	cwd: string | undefined;
	node: string | undefined;
	onDone: () => void;
	onCancel: () => void;
};

const textSx = { px: 2.5, fontSize: 15, color: "text.secondary" } as const;

export function PhoneMarkDoneConfirm({
	target,
	cwd,
	node,
	onDone,
	onCancel,
}: Props) {
	const { itemId, phase, totalPhases } = target;
	const { busy, error, confirm } = useMarkItemDone(itemId, cwd, onDone, node);
	return (
		<>
			<Box sx={textSx}>
				Mark {formatItemId(itemId)} done and end its session. {phase ?? 0} of{" "}
				{totalPhases ?? 0} phases completed.
			</Box>
			{error && (
				<Box role="alert" sx={[textSx, { pt: 1.5, color: "error.main" }]}>
					{error}
				</Box>
			)}
			<PhoneSheetButton disabled={busy} onClick={confirm}>
				Mark done
			</PhoneSheetButton>
			<PhoneSheetButton variant="outlined" onClick={onCancel}>
				Cancel
			</PhoneSheetButton>
		</>
	);
}
