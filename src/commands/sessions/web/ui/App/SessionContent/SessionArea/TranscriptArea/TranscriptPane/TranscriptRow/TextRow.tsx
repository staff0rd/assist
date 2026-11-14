import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { queuedRowActionsClassName } from "../../QueuedRowActions";
import { TextRowBody } from "./TextRow/TextRowBody";
import { TextRowLabel } from "./TextRow/TextRowLabel";

const actions = `.${queuedRowActionsClassName}`;

const revealActionsSx = {
	[`& ${actions}`]: { opacity: 0, transition: "opacity 120ms" },
	[`&:hover ${actions}, &:focus-within ${actions}`]: { opacity: 1 },
	"@media (hover: none)": { [`& ${actions}`]: { opacity: 1 } },
} as const;

export function TextRow({
	role,
	text,
	term,
	queued,
	actions,
}: {
	role: "user" | "assistant";
	text: string;
	term: string;
	queued?: boolean;
	actions?: ReactNode;
}) {
	const isUser = role === "user";
	const accent = isUser ? "info.main" : "success.main";
	return (
		<Box
			sx={{
				mb: 1.5,
				pl: 1.5,
				py: 1,
				pr: 1,
				borderLeft: 2,
				borderLeftStyle: queued ? "dashed" : "solid",
				borderColor: accent,
				borderTopRightRadius: 1,
				borderBottomRightRadius: 1,
				bgcolor: isUser ? "action.hover" : "transparent",
				...revealActionsSx,
			}}
		>
			<TextRowLabel
				isUser={isUser}
				accent={accent}
				queued={queued}
				actions={actions}
			/>
			<Box sx={{ opacity: queued ? 0.65 : 1 }}>
				<TextRowBody isUser={isUser} text={text} term={term} />
			</Box>
		</Box>
	);
}
