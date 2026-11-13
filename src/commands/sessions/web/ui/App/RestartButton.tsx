import { Box } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { harnessResumesConversation } from "../../../../../shared/harnessResumesConversation";
import { ConfirmDialog } from "../../../../backlog/web/ui/components/ConfirmDialog";
import { useShiftSkipConfirm } from "../useShiftSkipConfirm";
import { ActionButton } from "./ActionButton";
import { StartOverMenu } from "./StartOverMenu";

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
	return (
		<>
			<Box
				component="span"
				sx={{ display: "inline-flex", alignItems: "center" }}
			>
				<ActionButton
					label="Restart"
					title={withHint(`Restart session ${id}`)}
					icon={<RestartAltIcon sx={{ fontSize: 14 }} />}
					{...triggerHandlers}
				/>
				{onStartOver && <StartOverMenu id={id} onStartOver={onStartOver} />}
			</Box>
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
