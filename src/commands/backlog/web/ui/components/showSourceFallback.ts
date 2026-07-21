export function showSourceFallback(target: HTMLElement, source: string): void {
	const pre = document.createElement("pre");
	const code = document.createElement("code");
	code.className = "language-mermaid";
	code.textContent = source;
	pre.appendChild(code);
	target.replaceChildren(pre);
}

export function removeStrayMermaidNode(id: string): void {
	document.getElementById(`d${id}`)?.remove();
	document.getElementById(id)?.remove();
}
