import Box from "@mui/material/Box";
import { MarkdownHtml } from "../../../../../backlog/web/ui/components/MarkdownHtml";
import { renderMarkdownInline } from "../../../../../backlog/web/ui/components/renderMarkdown";

export const phaseDetailSx = {
	gridColumn: 2,
	fontSize: 13,
	color: "text.secondary",
} as const;

const listSx = {
	gridColumn: 2,
	m: 0,
	mt: 0.5,
	pl: 2.25,
	fontSize: 14,
	lineHeight: 1.45,
	"& li": { mb: 0.5 },
} as const;

export function PhonePhaseList({
	title,
	lines,
}: {
	title: string;
	lines: string[];
}) {
	if (lines.length === 0) return null;
	return (
		<>
			<Box sx={[phaseDetailSx, { mt: 0.75, fontWeight: 600 }]}>{title}</Box>
			<Box component="ul" sx={listSx}>
				{lines.map((line) => (
					<li key={line}>
						<MarkdownHtml
							component="span"
							className="markdown"
							html={renderMarkdownInline(line)}
						/>
					</li>
				))}
			</Box>
		</>
	);
}
