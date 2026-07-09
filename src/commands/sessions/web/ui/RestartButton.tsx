import RestartAltIcon from "@mui/icons-material/RestartAlt";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";

export function RestartButton({ onRestart }: { onRestart: () => void }) {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					setConfirming(true);
				}}
				title="Restart"
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<RestartAltIcon sx={{ fontSize: 14 }} />
			</IconButton>
			{confirming && (
				<ConfirmDialog
					title="Restart session"
					message="Restart this Claude session? It resumes the conversation, stopping the running process first."
					confirmLabel="Restart"
					onConfirm={() => {
						setConfirming(false);
						onRestart();
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
		</>
	);
}
