import { Box, useTheme } from "@mui/material";
import { marked } from "marked";
import { useMemo } from "react";
import { markdownSx } from "./markdownSx";
import { MermaidDiagram } from "./MermaidDiagram";
import { splitMarkdownSegments } from "./splitMarkdownSegments";

export function MarkdownBlock({
	content,
	renderMermaid = false,
}: {
	content: string;
	renderMermaid?: boolean;
}) {
	const mode = useTheme().palette.mode;
	const segments = useMemo(
		() => (renderMermaid ? splitMarkdownSegments(content) : null),
		[content, renderMermaid],
	);

	if (!segments) {
		return (
			<Box
				className="markdown"
				sx={markdownSx}
				dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
			/>
		);
	}

	return (
		<Box className="markdown" sx={markdownSx}>
			{segments.map((segment) =>
				segment.type === "mermaid" ? (
					<MermaidDiagram
						key={segment.key}
						source={segment.source}
						mode={mode}
					/>
				) : (
					<Box
						key={segment.key}
						dangerouslySetInnerHTML={{ __html: segment.html }}
					/>
				),
			)}
		</Box>
	);
}
