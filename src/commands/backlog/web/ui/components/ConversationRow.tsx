import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, IconButton, Typography } from "@mui/material";
import type { MouseEvent } from "react";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import type { Conversation } from "../types";

const rowSx = { display: "flex", alignItems: "center", gap: 1 } as const;

const kindSx = {
	color: "text.secondary",
	fontFamily: "monospace",
} as const;

const labelSx = { flex: 1, overflowWrap: "anywhere" } as const;

const resumeSx = {
	color: "text.disabled",
	"&:hover": { color: "text.primary" },
} as const;

export function ConversationRow({
	conversation,
}: {
	conversation: Conversation;
}) {
	const { resumeSession } = useSessionLaunchContext();
	const handleResume = (event: MouseEvent) => {
		event.stopPropagation();
		resumeSession(
			conversation.sessionId,
			conversation.cwd ?? "",
			conversation.title,
			conversation.harness,
		);
	};
	return (
		<Box sx={rowSx}>
			<Typography variant="body2" component="span" sx={kindSx}>
				session
			</Typography>
			<Typography variant="body2" component="span" sx={labelSx}>
				{conversation.title ?? conversation.sessionId}
			</Typography>
			<IconButton
				size="small"
				title="Resume"
				sx={resumeSx}
				onClick={handleResume}
			>
				<PlayArrowIcon sx={{ fontSize: 14 }} />
			</IconButton>
		</Box>
	);
}
