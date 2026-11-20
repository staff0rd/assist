import type { SxProps, Theme } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useEffect, useRef, useState } from "react";
import { dropdownStyle } from "./DropdownWrapper";
import { FilterInput } from "./FilterInput";
import { filterReposByName } from "./filterReposByName";
import { RepoMenuList } from "./RepoMenuList";
import { useListKeyboardNav } from "./useListKeyboardNav";

const menuSx: SxProps<Theme> = {
	...dropdownStyle,
} as SxProps<Theme>;

export function RepoList({
	repos,
	selected,
	onSelect,
	close,
	initialFilter = "",
}: {
	repos: string[];
	selected: string;
	onSelect: (cwd: string) => void;
	close: () => void;
	initialFilter?: string;
}) {
	const [filter, setFilter] = useState(initialFilter);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const query = filter.trim().toLowerCase();
	const filtered = filterReposByName(repos, query);

	const { highlight, setHighlight, onKeyDown } = useListKeyboardNav(
		filtered,
		query,
		onSelect,
		close,
	);

	const select = (cwd: string) => {
		onSelect(cwd);
		close();
	};

	return (
		<Paper elevation={4} sx={menuSx}>
			<FilterInput
				inputRef={inputRef}
				value={filter}
				onChange={setFilter}
				onKeyDown={onKeyDown}
				placeholder="Filter repos..."
			/>
			<RepoMenuList
				repos={filtered}
				selected={selected}
				highlight={highlight}
				onHighlight={setHighlight}
				onSelect={select}
			/>
		</Paper>
	);
}
