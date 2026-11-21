import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import IconButton from "@mui/material/IconButton";
import type { PointerEvent } from "react";
import { shellSx } from "../App/SessionContent/SessionArea/TranscriptArea/shellSx";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

function sendLabel(shell: boolean, suggestion: boolean) {
	if (shell) return "Run command";
	return suggestion ? "Send suggestion" : "Send";
}

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

export function PhoneReplySend({
	disabled,
	shell = false,
	suggestion = false,
	onSend,
}: {
	disabled: boolean;
	shell?: boolean;
	suggestion?: boolean;
	onSend: () => void;
}) {
	return (
		<IconButton
			aria-label={sendLabel(shell, suggestion)}
			sx={[phoneReplyBarSx.send, shell && shellSx.run]}
			disabled={disabled}
			onPointerDown={keepKeyboardOpen}
			onClick={onSend}
		>
			{shell ? (
				<PlayArrowRoundedIcon fontSize="small" />
			) : (
				<ArrowUpwardIcon fontSize="small" />
			)}
		</IconButton>
	);
}
