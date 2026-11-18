import { Button } from "@mui/material";
import { useState } from "react";
import { rewindPhase } from "../api";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { useRepoCwd } from "../useRepoCwd";
import { RewindDialog } from "./RewindDialog";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

const rewindSx = {
	ml: "auto",
	minHeight: 0,
	px: "6px",
	py: "2px",
	fontSize: sessionTextSize(12),
	fontWeight: 500,
	borderRadius: "4px",
} as const;

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
	const cwd = useRepoCwd();
	const node = useApiNode();
	const [showDialog, setShowDialog] = useState(false);
	return (
		<>
			<Button
				size="small"
				color="primary"
				variant="text"
				onClick={() => setShowDialog(true)}
				sx={rewindSx}
			>
				Rewind
			</Button>
			{showDialog && (
				<RewindDialog
					phaseName={phaseName}
					onConfirm={async (reason) => {
						await rewindPhase(itemId, phaseNumber, reason, cwd, node);
						await onRewound();
					}}
					onCancel={() => setShowDialog(false)}
				/>
			)}
		</>
	);
}
