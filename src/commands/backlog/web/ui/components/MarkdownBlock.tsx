import { Box } from "@mui/material";
import { marked } from "marked";
import { markdownSx } from "./markdownSx";

export function MarkdownBlock({ content }: { content: string }) {
	return (
		<Box
			className="markdown"
			sx={markdownSx}
			dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
		/>
	);
}
