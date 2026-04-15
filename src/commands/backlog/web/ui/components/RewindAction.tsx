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
			<button
				type="button"
				className="ml-auto text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-full px-2 py-0.5 font-medium cursor-pointer"
				onClick={() => setShowDialog(true)}
			>
				Rewind
			</button>
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
