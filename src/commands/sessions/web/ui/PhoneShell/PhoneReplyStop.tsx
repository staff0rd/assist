import StopRoundedIcon from "@mui/icons-material/StopRounded";
import IconButton from "@mui/material/IconButton";
import type { PointerEvent } from "react";
import type { ReplyStop } from "./PhoneReplyBar";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

export function PhoneReplyStop({ disabled, onStop }: ReplyStop) {
	return (
		<IconButton
			aria-label="Stop turn"
			sx={phoneReplyBarSx.stop}
			disabled={disabled}
			onPointerDown={keepKeyboardOpen}
			onClick={onStop}
		>
			<StopRoundedIcon fontSize="small" />
		</IconButton>
	);
}
