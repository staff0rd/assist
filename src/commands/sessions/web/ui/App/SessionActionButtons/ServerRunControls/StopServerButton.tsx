import StopIcon from "@mui/icons-material/Stop";
import { ActionButton } from "../../ActionButton";
import { useServerActionsContext } from "../../useServerActionsContext";

export function StopServerButton({ id }: { id: string }) {
	const { onStop } = useServerActionsContext();
	return (
		<ActionButton
			label="Stop"
			title="Stop server"
			tone="stop"
			icon={<StopIcon sx={{ fontSize: 16 }} />}
			onClick={(e) => {
				e.stopPropagation();
				onStop(id);
			}}
		/>
	);
}
