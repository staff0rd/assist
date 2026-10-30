const PANEL_CSS = `
.panel {
	position: fixed;
	right: 16px;
	bottom: 16px;
	z-index: 2147483647;
	width: min(560px, calc(100vw - 32px));
	max-height: calc(100vh - 32px);
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px;
	box-sizing: border-box;
	border: 1px solid #d0d7de;
	border-radius: 8px;
	background: #fff;
	color: #1f2328;
	font: 14px/20px -apple-system, BlinkMacSystemFont, sans-serif;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
pre {
	margin: 0;
	padding: 8px;
	overflow: auto;
	min-height: 48px;
	border-radius: 6px;
	background: #f6f8fa;
	font: 12px/18px ui-monospace, SFMono-Regular, Menlo, monospace;
	white-space: pre;
}
.actions { display: flex; align-items: center; gap: 8px; }
.countdown { flex: 1; color: #59636e; font-size: 12px; }
button { padding: 4px 12px; border-radius: 6px; border: 1px solid #d0d7de; font: inherit; cursor: pointer; background: #f6f8fa; color: inherit; }
button.run { background: #1f883d; border-color: #1f883d; color: #fff; }
`;

export function buildRunApprovalPanel(code: string) {
	const host = document.createElement("div");
	host.setAttribute("data-assist-run-approval", "");
	const shadow = host.attachShadow({ mode: "open" });
	shadow.innerHTML = `<style>${PANEL_CSS}</style>
<div class="panel" role="dialog" aria-label="assist script approval">
	<strong>assist wants to run this script on this page</strong>
	<pre></pre>
	<div class="actions">
		<span class="countdown"></span>
		<button type="button" class="dismiss">Dismiss</button>
		<button type="button" class="run">Run</button>
	</div>
</div>`;
	(shadow.querySelector("pre") as HTMLElement).textContent = code;
	return {
		host,
		countdown: shadow.querySelector(".countdown") as HTMLElement,
		run: shadow.querySelector("button.run") as HTMLButtonElement,
		dismiss: shadow.querySelector("button.dismiss") as HTMLButtonElement,
	};
}
