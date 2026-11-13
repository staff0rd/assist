import Popover from "@mui/material/Popover";
import { useSuggestedSlashCommands } from "../../../../../slashSuggestions/useSuggestedSlashCommands";
import type { SessionInfo } from "../../../../../types";
import { usePersistedPrompt } from "../../../../../usePersistedPrompt";
import { useSessionLaunchContext } from "../../../../../useSessionLaunchContext";
import { FreePromptForm } from "./FreePromptForm";

export function AddAgentPopover({
	session,
	anchorEl,
	onClose,
}: {
	session: SessionInfo;
	anchorEl: HTMLElement | null;
	onClose: () => void;
}) {
	const { launchAgentInStream } = useSessionLaunchContext();
	const [prompt, setPrompt] = usePersistedPrompt(`add-agent:${session.id}`);
	const commands = useSuggestedSlashCommands(
		session.harness,
		anchorEl ? session.cwd : undefined,
		session.node,
	);
	return (
		<Popover
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			onClick={(e) => e.stopPropagation()}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
		>
			<FreePromptForm
				anchored
				commands={commands}
				value={prompt}
				onChange={setPrompt}
				onSubmit={() => {
					launchAgentInStream(session.id, prompt, session.cwd);
					setPrompt("");
					onClose();
				}}
			/>
		</Popover>
	);
}
