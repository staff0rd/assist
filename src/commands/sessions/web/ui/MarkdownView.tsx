import Box from "@mui/material/Box";
import { marked } from "marked";

export function MarkdownView({ content }: { content: string }) {
	return (
		<Box
			className="markdown"
			sx={{
				flex: 1,
				overflow: "auto",
				p: 2,
				lineHeight: 1.7,
				"& p": { mt: 0 },
				wordBreak: "break-word",
			}}
			dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
		/>
	);
}
