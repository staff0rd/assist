import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

export function DismissButton({ onDismiss }: { onDismiss: () => void }) {
	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				onDismiss();
			}}
			title="Dismiss"
			sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
		>
			<CloseIcon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
