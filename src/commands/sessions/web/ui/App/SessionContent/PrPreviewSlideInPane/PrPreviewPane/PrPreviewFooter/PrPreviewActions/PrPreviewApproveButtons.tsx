import { Button, Tooltip } from "@mui/material";
import type { MouseEvent } from "react";
import type { PreviewStartTarget } from "../../../../../../../../shared/PreviewDecision";
import { useModifiersHeld } from "../../../../../../useModifiersHeld";
import { usePreviewPrimaryAction } from "../../../../../usePreviewPrimaryAction";
import { StartNodePicker } from "./PrPreviewApproveButtons/StartNodePicker";
import { useStartNodeChoice } from "./PrPreviewApproveButtons/useStartNodeChoice";

const isShift = (e: { shiftKey: boolean }) => e.shiftKey;

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
	const shift = useModifiersHeld(isShift);
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
		e.shiftKey ? onApproveAndStart(startNode.target) : onApprove();
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
			<Tooltip describeChild title="Shift+click: Approve + start">
				<Button
					color="primary"
					variant="contained"
					onClick={onClick}
					{...primary}
				>
					{shift ? "Approve + start" : "Approve"}
				</Button>
			</Tooltip>
		</>
	);
}
