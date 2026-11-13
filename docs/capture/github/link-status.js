const links = [
	["issues", 101, "issue-open", "Search ignores archived items"],
	["issues", 102, "issue-completed", "Export drops the header row"],
	["issues", 103, "issue-not-planned", "Support Internet Explorer"],
	["pull", 104, "pr-open", "Add CSV import"],
	["pull", 105, "pr-draft", "Try a new settings layout"],
	["pull", 106, "pr-merged", "Fix the export header row"],
	["pull", 107, "pr-closed", "Rewrite search in Rust"],
];
globalThis.assistCaptureLinkStates = Object.fromEntries(
	links.map(([, number, state]) => [`staff0rd/sandbox#${number}`, state]),
);
const body = document.querySelector(
	"[id^='issuecomment-'] .markdown-body, .comment-body.markdown-body",
);
body.innerHTML = `<p>Related work:</p><ul>${links
	.map(
		([kind, number, , title]) =>
			`<li><a href="https://github.com/staff0rd/sandbox/${kind}/${number}">${title}</a></li>`,
	)
	.join("")}</ul>`;
body.setAttribute("data-capture-link-status", "");
