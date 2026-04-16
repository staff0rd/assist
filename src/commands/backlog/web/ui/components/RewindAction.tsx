import { Button } from "@mui/material";
import { useState } from "react";
import { rewindPhase } from "../api";
import { RewindDialog } from "./RewindDialog";

type RewindActionProps = {
	itemId: number;
	phaseNumber: number;
	phaseName: string;
	onRewound: () => Promise<void>;
};

export function RewindAction({
	itemId,
	phaseNumber,
	phaseName,
	onRewound,
}: RewindActionProps) {
	const [showDialog, setShowDialog] = useState(false);
	return (
		<>
			<Button
				size="small"
				color="warning"
				variant="outlined"
				onClick={() => setShowDialog(true)}
				sx={{ ml: "auto", textTransform: "none", fontSize: "0.75rem" }}
			>
				Rewind
			</Button>
			{showDialog && (
				<RewindDialog
					phaseName={phaseName}
					onConfirm={async (reason) => {
						await rewindPhase(itemId, phaseNumber, reason);
						await onRewound();
					}}
					onCancel={() => setShowDialog(false)}
				/>
			)}
		</>
	);
}
