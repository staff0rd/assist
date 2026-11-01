import ReplayIcon from "@mui/icons-material/Replay";
import { ActionButton } from "../../ActionButton";
import type { ShortcutName } from "../../shortcutRegistry";

export function RetryButton({
	id,
	onRetry,
	shortcut,
	server,
}: {
	id: string;
	onRetry: (replace?: boolean) => void;
	shortcut?: ShortcutName;
	server?: boolean;
}) {
	const hint = server
		? " (shift+click replaces a running server without asking)"
		: "";
	return (
		<ActionButton
			label="Retry"
			title={`Retry session ${id}${hint}`}
			shortcut={shortcut}
			icon={<ReplayIcon sx={{ fontSize: 14 }} />}
			onClick={(e) => {
				e.stopPropagation();
				onRetry(server && e.shiftKey ? true : undefined);
			}}
		/>
	);
}
