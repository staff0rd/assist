import { Box } from "@mui/material";
import { marked } from "marked";

const markdownSx = { lineHeight: 1.7, "& p": { mt: 0 } } as const;

export function MarkdownBlock({ content }: { content: string }) {
	return (
		<Box
			className="markdown"
			sx={markdownSx}
			dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
		/>
	);
}
