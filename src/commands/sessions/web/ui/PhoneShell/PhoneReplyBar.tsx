import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import type { PointerEvent } from "react";
import { useState } from "react";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";
import { touchTarget } from "../designSystem/touchTarget";

const barSx = {
	flex: "none",
	display: "flex",
	alignItems: "flex-end",
	gap: 1,
	px: 1.5,
	py: 1.25,
	bgcolor: "background.paper",
} as const;

const fieldSx = {
	flex: 1,
	minHeight: touchTarget,
	px: 1.75,
	py: 1,
	borderRadius: "24px",
	border: 1,
	borderColor: "divider",
	bgcolor: "background.default",
	fontSize: 16,
	"&.Mui-focused": { borderColor: "primary.main" },
} as const;

const sendSx = {
	flex: "none",
	bgcolor: "primary.main",
	color: "primary.contrastText",
	"&:hover": { bgcolor: "primary.main" },
	"&.Mui-disabled": {
		bgcolor: raisedBgcolor,
		color: "text.disabled",
	},
} as const;

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

export function PhoneReplyBar({ onSend }: { onSend: (text: string) => void }) {
	const [text, setText] = useState("");
	const send = () => {
		if (!text.trim()) return;
		onSend(text);
		setText("");
	};

	return (
		<Box sx={barSx}>
			<InputBase
				multiline
				maxRows={5}
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Reply to Claude…"
				sx={fieldSx}
				inputProps={{ "aria-label": "Reply" }}
			/>
			<IconButton
				aria-label="Send"
				sx={sendSx}
				disabled={!text.trim()}
				onPointerDown={keepKeyboardOpen}
				onClick={send}
			>
				<ArrowUpwardIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
