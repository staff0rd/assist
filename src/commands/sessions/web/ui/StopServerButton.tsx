import StopIcon from "@mui/icons-material/Stop";
import IconButton from "@mui/material/IconButton";
import { useServerActionsContext } from "./useServerActionsContext";

export function StopServerButton({ id }: { id: string }) {
	const { onStop } = useServerActionsContext();
	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				onStop(id);
			}}
			title="Stop server"
			sx={{ color: "success.main", "&:hover": { color: "error.main" } }}
		>
			<StopIcon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
