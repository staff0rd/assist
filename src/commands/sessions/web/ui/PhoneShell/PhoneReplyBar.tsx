import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import type { PointerEvent } from "react";
import { useState } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

export function PhoneReplyBar({
	harness,
	onSend,
}: {
	harness?: HarnessKind;
	onSend: (text: string) => void;
}) {
	const [text, setText] = useState("");
	const send = () => {
		if (!text.trim()) return;
		onSend(text);
		setText("");
	};

	return (
		<Box sx={phoneReplyBarSx.bar}>
			<InputBase
				multiline
				maxRows={5}
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder={`Reply to ${harnessLabel(harness)}…`}
				sx={phoneReplyBarSx.field}
				inputProps={{ "aria-label": "Reply" }}
			/>
			<IconButton
				aria-label="Send"
				sx={phoneReplyBarSx.send}
				disabled={!text.trim()}
				onPointerDown={keepKeyboardOpen}
				onClick={send}
			>
				<ArrowUpwardIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
