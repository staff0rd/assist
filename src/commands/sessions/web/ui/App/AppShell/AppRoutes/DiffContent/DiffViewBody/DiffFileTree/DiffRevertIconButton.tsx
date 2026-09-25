import UndoOutlined from "@mui/icons-material/UndoOutlined";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../../../../../../../backlog/web/ui/components/ConfirmDialog";

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
	const [confirming, setConfirming] = useState(false);

	return (
		<>
			<IconButton
				size="small"
				aria-label={label}
				title={title}
				onClick={(event) => {
					event.stopPropagation();
					setConfirming(true);
				}}
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
						setConfirming(false);
						onConfirm();
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
		</>
	);
}
