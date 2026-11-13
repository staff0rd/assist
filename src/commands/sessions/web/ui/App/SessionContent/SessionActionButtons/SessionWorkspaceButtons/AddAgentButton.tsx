import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { useState } from "react";
import { ActionButton } from "../../../ActionButton";
import { AddAgentPopover } from "./AddAgentButton/AddAgentPopover";
import { canAddAgent } from "./AddAgentButton/canAddAgent";
import type { ShortcutName } from "../../../shortcutRegistry";
import type { SessionInfo } from "../../../../types";

export function AddAgentButton({
	session,
	shortcut,
}: {
	session: SessionInfo;
	shortcut?: ShortcutName;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	if (!canAddAgent(session)) return null;

	return (
		<>
			<ActionButton
				label="Add agent"
				title="Add another agent to this session's workspace"
				ariaLabel="add agent"
				shortcut={shortcut}
				icon={<GroupAddOutlinedIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setAnchorEl(e.currentTarget);
				}}
			/>
			<AddAgentPopover
				session={session}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
			/>
		</>
	);
}
