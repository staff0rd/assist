import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { ConfirmDialog } from "../../../../../../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { StopCardActivation } from "../../../../../../../../../StopCardActivation";
import { useShiftSkipConfirm } from "../../../../../../../../../useShiftSkipConfirm";

export const groupCloseClassName = "group-close";

const buttonSx = {
	p: "2px",
	my: "-2px",
	opacity: 0,
	color: "text.disabled",
	"&:hover": { color: "text.primary" },
	"&:focus-visible": { opacity: 1 },
} as const;

export function GroupCloseButton({
	label,
	sessionIds,
	onDismiss,
}: {
	label: string;
	sessionIds: string[];
	onDismiss: (id: string) => void;
}) {
	const closeAll = () => {
		for (const id of sessionIds) onDismiss(id);
	};
	const { confirming, close, triggerHandlers, withHint } =
		useShiftSkipConfirm(closeAll);
	const count = sessionIds.length;
	const noun = count === 1 ? "session" : "sessions";

	return (
		<>
			<IconButton
				size="small"
				className={groupCloseClassName}
				{...triggerHandlers}
				title={withHint(`Close all sessions in ${label}`)}
				sx={buttonSx}
			>
				<CloseIcon sx={{ fontSize: 14 }} />
			</IconButton>
			{confirming && (
				<StopCardActivation>
					<ConfirmDialog
						title={`Close ${label}`}
						message={`This will close all ${count} ${noun} in ${label}, including starred and nested sessions. Running sessions will be stopped.`}
						confirmLabel={`Close ${count}`}
						onConfirm={() => {
							close();
							closeAll();
						}}
						onCancel={close}
					/>
				</StopCardActivation>
			)}
		</>
	);
}
