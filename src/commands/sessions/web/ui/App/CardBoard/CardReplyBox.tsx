import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { type FormEvent, useState } from "react";
import { handleEnterSubmit } from "../handleEnterSubmit";

export function CardReplyBox({ onSend }: { onSend: (text: string) => void }) {
	const [text, setText] = useState("");
	const submit = (e: FormEvent) => {
		e.preventDefault();
		if (!text.trim()) return;
		onSend(text);
		setText("");
	};
	return (
		<Box
			component="form"
			onSubmit={submit}
			sx={(t) => ({
				display: "flex",
				alignItems: "flex-end",
				gap: 1,
				p: 2,
				borderTop: 1,
				borderColor: t.tokens.color.line,
			})}
		>
			<InputBase
				multiline
				maxRows={6}
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={handleEnterSubmit}
				placeholder="Reply…"
				inputProps={{ "aria-label": "Reply" }}
				sx={(t) => ({
					flex: 1,
					px: 1.5,
					py: 1,
					border: 1,
					borderColor: t.tokens.color.line,
					borderRadius: `${t.tokens.radius.sm}px`,
					bgcolor: "background.default",
					"&.Mui-focused": { borderColor: "primary.main" },
				})}
			/>
			<Button type="submit" variant="contained" disabled={!text.trim()}>
				Send
			</Button>
		</Box>
	);
}
