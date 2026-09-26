import { comboboxKeyHandler } from "./useRepoCombobox/comboboxKeyHandler";
import { filterReposByName } from "./useRepoCombobox/filterReposByName";
import { useComboboxOpen } from "./useRepoCombobox/useComboboxOpen";
import { useRepoText } from "./useRepoCombobox/useRepoText";
import { useListKeyboardNav } from "../../../../useListKeyboardNav";

export function useRepoCombobox(
	repos: string[],
	value: string,
	onChange: (cwd: string) => void,
) {
	const list = useComboboxOpen();
	const input = useRepoText(value);
	const filtered = filterReposByName(repos, list.query);

	const accept = (cwd: string) => {
		onChange(cwd);
		input.showRepo(cwd);
	};
	const nav = useListKeyboardNav(filtered, list.query, accept, list.close);
	const seedHighlight = () =>
		nav.setHighlight(Math.max(repos.indexOf(value), 0));
	const openList = () => {
		seedHighlight();
		list.show();
	};

	return {
		open: list.open,
		text: input.text,
		filtered,
		highlight: nav.highlight,
		setHighlight: nav.setHighlight,
		onKeyDown: comboboxKeyHandler({
			open: list.open,
			highlighted: filtered[nav.highlight],
			accept,
			close: list.close,
			navigate: nav.onKeyDown,
			openList,
		}),
		onClick: () => {
			if (!list.open) openList();
		},
		onType: (next: string) => {
			input.setText(next);
			list.filterBy(next);
		},
		onFocus: seedHighlight,
		onBlur: () => {
			list.close();
			input.showRepo(value);
		},
		pick: (cwd: string) => {
			accept(cwd);
			list.close();
		},
	};
}
