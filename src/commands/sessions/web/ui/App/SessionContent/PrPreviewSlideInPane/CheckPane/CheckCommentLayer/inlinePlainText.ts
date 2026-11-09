import { renderMarkdownInline } from "../../../../../../../../backlog/web/ui/components/renderMarkdown";

export function inlinePlainText(text: string): string {
	return (
		new DOMParser().parseFromString(renderMarkdownInline(text), "text/html")
			.body.textContent ?? text
	);
}
