import { Button } from "@mui/material";
import { useState } from "react";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/RepoSelectionProvider";
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
	const { selectedCwd } = useRepoSelectionContext();
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
						await rewindPhase(
							itemId,
							phaseNumber,
							reason,
							selectedCwd || undefined,
						);
						await onRewound();
					}}
					onCancel={() => setShowDialog(false)}
				/>
			)}
		</>
	);
}
