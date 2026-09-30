import type { NextPr } from "../../../../../next/types";
import { prLaunchMeta } from "../../../prLaunchMeta";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useSessionLaunchContext } from "../../../../useSessionLaunchContext";
import { ReviewTypeDialog } from "../../ReviewTypeDialog";

export function NextReviewDialog({
	pr,
	onClose,
}: {
	pr: NextPr;
	onClose: () => void;
}) {
	const { selectedCwd, selectedNode } = useRepoSelectionContext();
	const { launchAssist } = useSessionLaunchContext();
	return (
		<ReviewTypeDialog
			pr={pr}
			onSelect={(args) => {
				launchAssist([...args, String(pr.number)], selectedCwd, {
					...prLaunchMeta(pr),
					node: selectedNode,
				});
				onClose();
			}}
			onCancel={onClose}
		/>
	);
}
