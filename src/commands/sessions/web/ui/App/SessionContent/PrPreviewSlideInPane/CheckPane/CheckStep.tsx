import { Box, type Theme } from "@mui/material";
import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../backlog/web/ui/components/MarkdownHtml";
import { renderMarkdownInline } from "../../../../../../../backlog/web/ui/components/renderMarkdown";
import { addCopyButtons } from "../../ShowPane/addCopyButtons";
import { copyCodeButtonSx } from "../../ShowPane/copyCodeButtonSx";
import { copyCodeOnClick } from "../../ShowPane/copyCodeOnClick";
import { inlineMarkdownSx } from "./InlineMarkdown";

const checkStepSx = (theme: Theme) => ({
	...inlineMarkdownSx,
	"& code": { ...inlineMarkdownSx["& code"], overflowWrap: "anywhere" },
	"& .copy-code": copyCodeButtonSx(theme),
});

export function CheckStep({ text }: { text: string }) {
	const html = useMemo(
		() => addCopyButtons(renderMarkdownInline(text)),
		[text],
	);
	return (
		<Box component="span" onClick={copyCodeOnClick}>
			<MarkdownHtml component="span" sx={checkStepSx} html={html} />
		</Box>
	);
}
