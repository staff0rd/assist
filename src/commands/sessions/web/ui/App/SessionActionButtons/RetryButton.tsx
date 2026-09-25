import ReplayIcon from "@mui/icons-material/Replay";
import { ActionButton } from "../ActionButton";

export function RetryButton({
	id,
	onRetry,
}: {
	id: string;
	onRetry: () => void;
}) {
	return (
		<ActionButton
			label="Retry"
			title={`Retry session ${id}`}
			icon={<ReplayIcon sx={{ fontSize: 14 }} />}
			onClick={(e) => {
				e.stopPropagation();
				onRetry();
			}}
		/>
	);
}
