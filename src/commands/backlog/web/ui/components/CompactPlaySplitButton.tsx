import { type MouseEvent, useRef, useState } from "react";
import type { CloseItemTarget } from "./CloseItemDialog";
import { CloseItemMenu } from "./CloseItemMenu";
import { CompactPlayButtonGroup } from "./CompactPlayButtonGroup";
import type { OrderEnds } from "./newestFirstListMoveButtons";
import { useMoveMenuItems } from "./useMoveMenuItems";
import { useCloseItemFlow } from "./useCloseItemFlow";
import { useRefineLaunch } from "./useRefineLaunch";

export function CompactPlaySplitButton({
	itemId,
	tooltip,
	disabled,
	onBuild,
	closeTarget,
	orderEnds,
}: {
	itemId: number;
	tooltip: string;
	disabled: boolean;
	onBuild: () => void;
	closeTarget: CloseItemTarget;
	orderEnds?: OrderEnds;
}) {
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const refine = useRefineLaunch(itemId);
	const closeFlow = useCloseItemFlow(itemId, closeTarget);
	const moves = useMoveMenuItems(itemId, orderEnds, () => setOpen(false));
	const stop = (event: MouseEvent) => event.stopPropagation();
	return (
		<>
			<CompactPlayButtonGroup
				anchorRef={anchorRef}
				tooltip={tooltip}
				disabled={disabled}
				onBuild={(event) => {
					stop(event);
					onBuild();
				}}
				onMore={(event) => {
					stop(event);
					setOpen(true);
				}}
			/>
			<CloseItemMenu
				anchorEl={anchorRef.current}
				open={open}
				onClose={() => setOpen(false)}
				onRefine={() => {
					setOpen(false);
					refine.launch([]);
				}}
				onSelect={(status, skipConfirm) => {
					setOpen(false);
					closeFlow.select(status, skipConfirm);
				}}
				stop={stop}
			>
				{moves}
			</CloseItemMenu>
			{closeFlow.overlays}
		</>
	);
}
