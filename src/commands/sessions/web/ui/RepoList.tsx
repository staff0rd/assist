import type { SxProps, Theme } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useEffect, useRef, useState } from "react";
import { dropdownStyle } from "./DropdownWrapper";
import { RepoFilterInput } from "./RepoFilterInput";
import { RepoMenuList } from "./RepoMenuList";
import { useRepoKeyboardNav } from "./useRepoKeyboardNav";

export function repoName(cwd: string): string {
	const sep = cwd.includes("\\") ? "\\" : "/";
	return cwd.split(sep).filter(Boolean).pop() ?? cwd;
}

const menuSx: SxProps<Theme> = {
	...dropdownStyle,
} as SxProps<Theme>;

export function RepoList({
	repos,
	selected,
	onSelect,
	close,
}: {
	repos: string[];
	selected: string;
	onSelect: (cwd: string) => void;
	close: () => void;
}) {
	const [filter, setFilter] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const query = filter.trim().toLowerCase();
	const filtered = query
		? repos.filter((cwd) => cwd.toLowerCase().includes(query))
		: repos;

	const { highlight, setHighlight, onKeyDown } = useRepoKeyboardNav(
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
			<RepoFilterInput
				inputRef={inputRef}
				value={filter}
				onChange={setFilter}
				onKeyDown={onKeyDown}
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
