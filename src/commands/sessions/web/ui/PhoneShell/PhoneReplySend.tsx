import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import IconButton from "@mui/material/IconButton";
import type { PointerEvent } from "react";
import { shellSx } from "../App/SessionContent/SessionArea/TranscriptArea/shellSx";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

export function PhoneReplySend({
	disabled,
	shell = false,
	onSend,
}: {
	disabled: boolean;
	shell?: boolean;
	onSend: () => void;
}) {
	return (
		<IconButton
			aria-label={shell ? "Run command" : "Send"}
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
