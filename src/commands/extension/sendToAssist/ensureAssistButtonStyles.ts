import { slateDesign } from "../../sessions/web/ui/designSystem/slateDesign";
import { type GithubColorMode, githubColorMode } from "../githubColorMode";
import { watchGithubColorMode } from "../watchGithubColorMode";

const STYLE_ATTRIBUTE = "data-assist-send-style";

function assistButtonCss(mode: GithubColorMode): string {
	const { color } = slateDesign[mode];
	return `
.assist-send {
	font-family: ${slateDesign.font.ui};
	font-size: 12px;
	font-weight: ${slateDesign.type.button.fontWeight};
	line-height: 20px;
	display: inline-flex;
	align-items: center;
	align-self: center;
	vertical-align: middle;
	gap: 6px;
	padding: 1px 8px 1px 5px;
	margin-left: 6px;
	border-radius: ${slateDesign.radius.sm}px;
	border: 1px solid ${color.line};
	background: ${color.raised};
	color: ${color.text.primary};
	color-scheme: ${mode};
	cursor: pointer;
	transition: background 0.2s ease, border-color 0.2s ease;
}
.assist-send img {
	width: 16px;
	height: 16px;
	display: block;
	transition: transform 0.2s ease;
}
.assist-send--header {
	padding: 3px 12px 3px 8px;
	margin-left: 0;
}
.assist-send--before-date {
	margin-right: 8px;
}
.assist-send:hover:not(:disabled) {
	border-color: ${color.text.disabled};
}
.assist-send:hover:not(:disabled) img {
	transform: scale(1.12);
}
.assist-send:active:not(:disabled) {
	background: ${color.selected};
}
.assist-send:focus-visible {
	outline: 2px solid ${color.primary.main};
	outline-offset: -2px;
}
.assist-send:disabled {
	cursor: progress;
	opacity: 0.6;
}
@media (prefers-reduced-motion: reduce) {
	.assist-send,
	.assist-send img {
		transition: none;
	}
}
`;
}

export function ensureAssistButtonStyles(): void {
	if (document.head.querySelector(`[${STYLE_ATTRIBUTE}]`)) return;
	const root = document.documentElement;
	const style = document.createElement("style");
	style.setAttribute(STYLE_ATTRIBUTE, "");
	style.textContent = assistButtonCss(githubColorMode(root));
	document.head.append(style);
	watchGithubColorMode(root, (mode) => {
		style.textContent = assistButtonCss(mode);
	});
}
