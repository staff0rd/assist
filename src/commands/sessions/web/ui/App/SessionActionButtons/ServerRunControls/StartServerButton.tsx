import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { ActionButton } from "../../ActionButton";
import { useServerActionsContext } from "../../useServerActionsContext";

export function StartServerButton({
	runName,
	cwd,
	launchedFrom,
}: {
	runName: string;
	cwd?: string;
	launchedFrom?: string;
}) {
	const { onStart } = useServerActionsContext();
	return (
		<ActionButton
			label={runName}
			title={`Start ${runName}`}
			tone="start"
			icon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
			onClick={(e) => {
				e.stopPropagation();
				onStart(runName, cwd, undefined, launchedFrom);
			}}
		/>
	);
}
