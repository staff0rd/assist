import type { GitRef } from "../types";

export function refLabel(ref: GitRef): string {
	if (ref.kind === "commit") {
		const subject = ref.title ? ` ${ref.title}` : "";
		return `${ref.ref.slice(0, 8)}${subject}`;
	}
	if (ref.kind === "pr") {
		const title = ref.title ? ` ${ref.title}` : "";
		const state = ref.state ? ` (${ref.state.toLowerCase()})` : "";
		return `#${ref.ref}${title}${state}`;
	}
	return ref.ref;
}
