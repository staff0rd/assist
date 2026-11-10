import { Button } from "@mui/material";
import type { PreviewStartTarget } from "../../../../../../../../shared/PreviewDecision";
import { usePreviewPrimaryAction } from "../../../../../usePreviewPrimaryAction";
import { StartNodePicker } from "./PrPreviewApproveButtons/StartNodePicker";
import { useStartNodeChoice } from "./PrPreviewApproveButtons/useStartNodeChoice";

export function PrPreviewApproveButtons({
	canStart,
	startOrigin,
	cwd,
	onApprove,
	onApproveAndStart,
}: {
	canStart: boolean;
	startOrigin?: string | undefined;
	cwd?: string | undefined;
	onApprove: () => void;
	onApproveAndStart: (startOn?: PreviewStartTarget) => void;
}) {
	const primary = usePreviewPrimaryAction();
	const startNode = useStartNodeChoice(cwd, startOrigin);
	return (
		<>
			<Button
				color="primary"
				variant={canStart ? "tonal" : "contained"}
				onClick={onApprove}
				{...(canStart ? {} : primary)}
			>
				Approve
			</Button>
			{canStart && startNode.nodes && startNode.target && (
				<StartNodePicker
					nodes={startNode.nodes}
					options={startNode.options}
					target={startNode.target}
					onPick={startNode.pick}
				/>
			)}
			{canStart && (
				<Button
					color="primary"
					variant="contained"
					onClick={() => onApproveAndStart(startNode.target)}
					{...primary}
				>
					Approve & start
				</Button>
			)}
		</>
	);
}
