import type { NextPr } from "../../../../../next/types";
import { prLaunchMeta } from "../../../prLaunchMeta";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useSessionLaunchContext } from "../../../../useSessionLaunchContext";
import { ReviewTypeDialog } from "../../ReviewTypeDialog";

export type NextReview = { pr: NextPr; cwd: string };

export function NextReviewDialog({
	review: { pr, cwd },
	onClose,
}: {
	review: NextReview;
	onClose: () => void;
}) {
	const { selectedNode } = useRepoSelectionContext();
	const { launchAssist } = useSessionLaunchContext();
	return (
		<ReviewTypeDialog
			pr={pr}
			onSelect={(args) => {
				launchAssist([...args, String(pr.number)], cwd, {
					...prLaunchMeta(pr),
					node: selectedNode,
				});
				onClose();
			}}
			onCancel={onClose}
		/>
	);
}
