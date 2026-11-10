import { Box, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { MarkdownHtml } from "./MarkdownHtml";
import { MermaidDiagram } from "./MermaidDiagram";
import type { MarkdownSegment } from "./splitMarkdownSegments";

export function MarkdownSegments({
	segments,
	sx,
	naturalWidth = false,
	skipDiagramText = false,
}: {
	segments: MarkdownSegment[];
	sx?: SxProps<Theme>;
	naturalWidth?: boolean;
	skipDiagramText?: boolean;
}) {
	const mode = useTheme().palette.mode;
	return (
		<Box className="markdown" sx={sx}>
			{segments.map((segment) =>
				segment.type === "mermaid" ? (
					<Box
						key={segment.key}
						data-preview-skip={skipDiagramText ? "" : undefined}
					>
						<MermaidDiagram
							source={segment.source}
							mode={mode}
							naturalWidth={naturalWidth}
						/>
					</Box>
				) : (
					<MarkdownHtml key={segment.key} html={segment.html} />
				),
			)}
		</Box>
	);
}
