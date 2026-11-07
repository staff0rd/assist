import UndoOutlined from "@mui/icons-material/UndoOutlined";
import IconButton from "@mui/material/IconButton";
import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { useShiftSkipConfirm } from "../../../../useShiftSkipConfirm";

export function DiffRevertIconButton({
	label,
	title,
	confirmTitle,
	confirmMessage,
	onConfirm,
}: {
	label: string;
	title: string;
	confirmTitle: string;
	confirmMessage: string;
	onConfirm: () => void;
}) {
	const { confirming, close, triggerHandlers, withHint } =
		useShiftSkipConfirm(onConfirm);

	return (
		<>
			<IconButton
				size="small"
				aria-label={label}
				title={withHint(title)}
				{...triggerHandlers}
				sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
			>
				<UndoOutlined sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<ConfirmDialog
					title={confirmTitle}
					message={confirmMessage}
					confirmLabel="Revert"
					onConfirm={() => {
						close();
						onConfirm();
					}}
					onCancel={close}
				/>
			)}
		</>
	);
}
