import { Button, Tooltip } from "@mui/material";
import type { MouseEvent } from "react";
import type { PreviewStartTarget } from "../../../../../../../../shared/PreviewDecision";
import { usePreviewPrimaryAction } from "../../../../../usePreviewPrimaryAction";
import { StartNodePicker } from "./PrPreviewApproveButtons/StartNodePicker";
import { useStartNodeChoice } from "./PrPreviewApproveButtons/useStartNodeChoice";
import { ApproveShortcuts } from "./PrPreviewApproveButtons/ApproveShortcuts";
import { useApproveLabel } from "./PrPreviewApproveButtons/useApproveLabel";

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
	onApproveAndStart: (startOn?: PreviewStartTarget, yolo?: boolean) => void;
}) {
	const primary = usePreviewPrimaryAction();
	const startNode = useStartNodeChoice(cwd, startOrigin);
	const label = useApproveLabel();
	if (!canStart)
		return (
			<Button
				color="primary"
				variant="contained"
				onClick={onApprove}
				{...primary}
			>
				Approve
			</Button>
		);
	const onClick = (e: MouseEvent) =>
		e.shiftKey ? onApproveAndStart(startNode.target, e.ctrlKey) : onApprove();
	return (
		<>
			{startNode.nodes && startNode.target && (
				<StartNodePicker
					nodes={startNode.nodes}
					options={startNode.options}
					target={startNode.target}
					onPick={startNode.pick}
				/>
			)}
			<Tooltip describeChild title={<ApproveShortcuts />}>
				<Button
					color="primary"
					variant="contained"
					onClick={onClick}
					{...primary}
				>
					{label}
				</Button>
			</Tooltip>
		</>
	);
}
