import { type SetStateAction, useCallback, useState } from "react";
import { loadPersisted, savePersisted } from "./App/loadPersisted";

const PROMPT_DRAFT_PREFIX = "assist:prompt-draft:";

export function usePersistedPrompt(
	scope: string,
): [string, (next: SetStateAction<string>) => void] {
	const key = PROMPT_DRAFT_PREFIX + scope;
	const [stored, setStored] = useState(() => ({
		key,
		prompt: loadPersisted<string>(key)[0] ?? "",
	}));
	const prompt =
		stored.key === key ? stored.prompt : (loadPersisted<string>(key)[0] ?? "");

	const setPrompt = useCallback(
		(next: SetStateAction<string>) => {
			setStored((current) => {
				const previous =
					current.key === key
						? current.prompt
						: (loadPersisted<string>(key)[0] ?? "");
				const value = typeof next === "function" ? next(previous) : next;
				savePersisted(key, value ? [value] : []);
				return { key, prompt: value };
			});
		},
		[key],
	);

	return [prompt, setPrompt];
}
