import Box from "@mui/material/Box";
import { TextRowBody } from "./TextRow/TextRowBody";
import { TextRowLabel } from "./TextRow/TextRowLabel";

export function TextRow({
	role,
	text,
	term,
	queued,
}: {
	role: "user" | "assistant";
	text: string;
	term: string;
	queued?: boolean;
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
				opacity: queued ? 0.65 : 1,
				borderTopRightRadius: 1,
				borderBottomRightRadius: 1,
				bgcolor: isUser ? "action.hover" : "transparent",
			}}
		>
			<TextRowLabel isUser={isUser} accent={accent} queued={queued} />
			<TextRowBody isUser={isUser} text={text} term={term} />
		</Box>
	);
}
