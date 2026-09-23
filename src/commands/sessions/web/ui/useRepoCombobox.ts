import { useState } from "react";
import { comboboxKeyHandler } from "./comboboxKeyHandler";
import { filterReposByName } from "./filterReposByName";
import { repoName } from "./RepoList";
import { useListKeyboardNav } from "./useListKeyboardNav";

export function useRepoCombobox(
	repos: string[],
	value: string,
	onChange: (cwd: string) => void,
) {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState(() => (value ? repoName(value) : ""));
	const [query, setQuery] = useState("");
	const filtered = filterReposByName(repos, query);

	const accept = (cwd: string) => {
		onChange(cwd);
		setText(repoName(cwd));
	};
	const close = () => {
		setOpen(false);
		setQuery("");
	};
	const nav = useListKeyboardNav(filtered, query, accept, close);

	return {
		open,
		text,
		filtered,
		highlight: nav.highlight,
		setHighlight: nav.setHighlight,
		onKeyDown: comboboxKeyHandler({
			open,
			highlighted: filtered[nav.highlight],
			accept,
			close,
			navigate: nav.onKeyDown,
		}),
		onType: (next: string) => {
			setText(next);
			setQuery(next);
			setOpen(true);
		},
		onFocus: () => {
			nav.setHighlight(Math.max(repos.indexOf(value), 0));
			setOpen(true);
		},
		onBlur: () => {
			close();
			setText(value ? repoName(value) : "");
		},
		pick: (cwd: string) => {
			accept(cwd);
			close();
		},
	};
}
