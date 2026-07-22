import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import IconButton from "@mui/material/IconButton";
import { useServerActionsContext } from "./useServerActionsContext";

export function StartServerButton({
	runName,
	cwd,
}: {
	runName: string;
	cwd?: string;
}) {
	const { onStart } = useServerActionsContext();
	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				onStart(runName, cwd);
			}}
			title={`Start ${runName}`}
			sx={{ color: "text.disabled", "&:hover": { color: "success.main" } }}
		>
			<PlayArrowIcon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
