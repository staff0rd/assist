import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { harnessResumesConversation } from "../../../../../shared/harnessResumesConversation";
import { ConfirmDialog } from "../../../../backlog/web/ui/components/ConfirmDialog";
import { useShiftSkipConfirm } from "../useShiftSkipConfirm";
import { RestartButtonGroup } from "./RestartButtonGroup";
import { RestartSegment } from "./RestartSegment";

function restartEffect(harness?: HarnessKind): string {
	return harnessResumesConversation(harness)
		? "resumes the conversation"
		: "relaunches it from the start";
}

export function RestartButton({
	id,
	onRestart,
	onStartOver,
	harness,
}: {
	id: string;
	onRestart: () => void;
	onStartOver?: () => void;
	harness?: HarnessKind;
}) {
	const { confirming, close, triggerHandlers, withHint } =
		useShiftSkipConfirm(onRestart);
	const restart = (
		<RestartSegment
			title={withHint(`Restart session ${id}`)}
			{...triggerHandlers}
		/>
	);
	return (
		<>
			{onStartOver ? (
				<RestartButtonGroup id={id} onStartOver={onStartOver}>
					{restart}
				</RestartButtonGroup>
			) : (
				restart
			)}
			{confirming && (
				<ConfirmDialog
					title={`Restart session ${id}`}
					message={`Restart this ${harnessLabel(harness)} session? It ${restartEffect(harness)}, stopping the running process first.`}
					confirmLabel="Restart"
					onConfirm={() => {
						close();
						onRestart();
					}}
					onCancel={close}
				/>
			)}
		</>
	);
}
