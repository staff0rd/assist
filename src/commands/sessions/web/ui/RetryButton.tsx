import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";

export function RetryButton({ onRetry }: { onRetry: () => void }) {
	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				onRetry();
			}}
			title="Retry"
			sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
		>
			<ReplayIcon sx={{ fontSize: 14 }} />
		</IconButton>
	);
}
