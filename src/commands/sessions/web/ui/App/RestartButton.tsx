import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useState } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessLabel";
import { harnessResumesConversation } from "../../../../../shared/harnessResumesConversation";
import { ConfirmDialog } from "../../../../backlog/web/ui/components/ConfirmDialog";
import { ActionButton } from "./ActionButton";

function restartEffect(harness?: HarnessKind): string {
	return harnessResumesConversation(harness)
		? "resumes the conversation"
		: "relaunches it from the start";
}

export function RestartButton({
	id,
	onRestart,
	harness,
}: {
	id: string;
	onRestart: () => void;
	harness?: HarnessKind;
}) {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			<ActionButton
				label="Restart"
				title={`Restart session ${id}`}
				icon={<RestartAltIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setConfirming(true);
				}}
			/>
			{confirming && (
				<ConfirmDialog
					title={`Restart session ${id}`}
					message={`Restart this ${harnessLabel(harness)} session? It ${restartEffect(harness)}, stopping the running process first.`}
					confirmLabel="Restart"
					onConfirm={() => {
						setConfirming(false);
						onRestart();
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
		</>
	);
}
