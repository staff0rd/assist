const REQUIRED = new Set(["what", "why"]);

export function sectionMark(heading: string, filled: ReadonlySet<string>) {
	const key = heading.trim().toLowerCase();
	if (key === "how")
		return '<span class="section-mark optional">optional</span>';
	if (!REQUIRED.has(key)) return "";
	return filled.has(key)
		? '<span class="section-mark">✓ section</span>'
		: '<span class="section-mark missing">✕ empty</span>';
}
