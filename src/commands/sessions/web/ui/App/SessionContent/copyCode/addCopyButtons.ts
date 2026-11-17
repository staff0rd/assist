const copyIcon =
	'<svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"/></svg>';
const checkIcon =
	'<svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

export function addCopyButtons(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	for (const code of Array.from(doc.body.querySelectorAll("code"))) {
		const button = doc.createElement("button");
		button.type = "button";
		button.className = "copy-code";
		button.setAttribute("aria-label", "Copy");
		button.title = "Copy";
		button.dataset.copy = (code.textContent ?? "").replace(/\n$/, "");
		button.innerHTML = copyIcon + checkIcon;
		const pre =
			code.parentElement?.tagName === "PRE" ? code.parentElement : null;
		if (pre) pre.appendChild(button);
		else code.after(button);
	}
	return doc.body.innerHTML;
}
