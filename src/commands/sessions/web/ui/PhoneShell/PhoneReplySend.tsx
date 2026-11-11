import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import IconButton from "@mui/material/IconButton";
import type { PointerEvent } from "react";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

export function PhoneReplySend({
	disabled,
	onSend,
}: {
	disabled: boolean;
	onSend: () => void;
}) {
	return (
		<IconButton
			aria-label="Send"
			sx={phoneReplyBarSx.send}
			disabled={disabled}
			onPointerDown={keepKeyboardOpen}
			onClick={onSend}
		>
			<ArrowUpwardIcon fontSize="small" />
		</IconButton>
	);
}
