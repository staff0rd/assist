import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "./formatRelativeTime";
import { StopCardActivation } from "./StopCardActivation";
import type { HistoricalSession } from "./types";

function SessionIdCaption({ claudeSessionId }: { claudeSessionId: string }) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = (e: React.MouseEvent) => {
		e.stopPropagation();
		void navigator.clipboard.writeText(claudeSessionId).then(() => {
			setCopied(true);
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), 1200);
		});
	};

	return (
		<StopCardActivation>
			<Tooltip
				title={copied ? "Copied!" : "Copy Claude session id"}
				open={copied || undefined}
			>
				<ButtonBase onClick={copy} sx={{ borderRadius: 0.5, px: 0.25 }}>
					<Typography
						variant="caption"
						color="text.disabled"
						sx={{ fontFamily: "monospace" }}
					>
						{claudeSessionId.slice(0, 8)}
					</Typography>
				</ButtonBase>
			</Tooltip>
		</StopCardActivation>
	);
}

export function HistoryCardFooter({ session }: { session: HistoricalSession }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				alignSelf: "flex-end",
			}}
		>
			{session.sessionId && (
				<SessionIdCaption claudeSessionId={session.sessionId} />
			)}
			<Typography variant="caption" color="text.disabled">
				{formatRelativeTime(session.timestamp)}
			</Typography>
		</Box>
	);
}
