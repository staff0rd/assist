import { Box } from "@mui/material";

const quoteSx = {
	borderLeft: 3,
	borderColor: "divider",
	pl: 1,
	color: "text.secondary",
	fontStyle: "italic",
	whiteSpace: "pre-wrap",
	wordBreak: "break-word",
	maxHeight: 120,
	overflow: "auto",
} as const;

export function QuoteBlock({ text }: { text: string }) {
	return <Box sx={quoteSx}>{text}</Box>;
}
