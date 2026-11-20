import { useState } from "react";
import { repoName } from "../../../../../../../../repoName";

const displayName = (cwd: string) => (cwd ? repoName(cwd) : "");

export function useRepoText(value: string) {
	const [text, setText] = useState(() => displayName(value));
	return {
		text,
		setText,
		showRepo: (cwd: string) => setText(displayName(cwd)),
	};
}
