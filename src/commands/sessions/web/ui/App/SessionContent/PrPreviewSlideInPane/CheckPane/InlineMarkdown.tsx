import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../backlog/web/ui/components/MarkdownHtml";
import { renderMarkdownInline } from "../../../../../../../backlog/web/ui/components/renderMarkdown";

const inlineMarkdownSx = {
	"& code": {
		fontFamily: "fontFamilyMono",
		fontSize: "0.88em",
		bgcolor: "action.hover",
		px: 0.5,
		borderRadius: 0.5,
	},
	"& a": { color: "primary.main", overflowWrap: "anywhere" },
} as const;

export function InlineMarkdown({ text }: { text: string }) {
	const html = useMemo(() => renderMarkdownInline(text), [text]);
	return <MarkdownHtml component="span" sx={inlineMarkdownSx} html={html} />;
}
