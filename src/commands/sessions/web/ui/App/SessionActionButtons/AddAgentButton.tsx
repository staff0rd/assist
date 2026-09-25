import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Popover from "@mui/material/Popover";
import { useState } from "react";
import { ActionButton } from "../ActionButton";
import { canAddAgent } from "./AddAgentButton/canAddAgent";
import { FreePromptForm } from "../FreePromptForm";
import type { SessionInfo } from "../../types";
import { useSessionLaunchContext } from "../../useSessionLaunchContext";

export function AddAgentButton({ session }: { session: SessionInfo }) {
	const { launchAgentInStream } = useSessionLaunchContext();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [prompt, setPrompt] = useState("");
	if (!canAddAgent(session)) return null;

	return (
		<>
			<ActionButton
				label="Add agent"
				title="Add another agent to this session's workspace"
				ariaLabel="add agent"
				icon={<GroupAddOutlinedIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setAnchorEl(e.currentTarget);
				}}
			/>
			<Popover
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				onClick={(e) => e.stopPropagation()}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<FreePromptForm
					anchored
					value={prompt}
					onChange={setPrompt}
					onSubmit={() => {
						launchAgentInStream(session.id, prompt, session.cwd);
						setPrompt("");
						setAnchorEl(null);
					}}
				/>
			</Popover>
		</>
	);
}
