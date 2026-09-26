import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { filePaletteMessage } from "./FilePalette/filePaletteMessage";
import { FilePaletteResults } from "./FilePalette/FilePaletteResults";
import { FilterInput } from "../../../../FilterInput";
import { AutoFocusDialog } from "../AutoFocusDialog";
import { useFileSearch } from "./FilePalette/useFileSearch";
import { useListKeyboardNav } from "../../../../useListKeyboardNav";
import { ApiNodeContext } from "../../../../useApiNode";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";

function filePath(path: string, cwd: string, node?: string): string {
	const params = new URLSearchParams({ path });
	if (cwd) params.set("cwd", cwd);
	if (cwd && node) params.set("node", node);
	return `/file?${params}`;
}

export function FilePalette({ onClose }: { onClose: () => void }) {
	const { worktreeNode } = useRepoSelectionContext();
	return (
		<ApiNodeContext.Provider value={worktreeNode}>
			<FilePaletteDialog onClose={onClose} />
		</ApiNodeContext.Provider>
	);
}

function FilePaletteDialog({ onClose }: { onClose: () => void }) {
	const { worktreeCwd, worktreeNode } = useRepoSelectionContext();
	const [query, setQuery] = useState("");
	const search = useFileSearch(worktreeCwd, query);
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);

	const openFile = (path: string) =>
		navigate(filePath(path, worktreeCwd, worktreeNode));

	const { highlight, setHighlight, onKeyDown } = useListKeyboardNav(
		search.files,
		query,
		openFile,
		onClose,
	);

	const select = (path: string) => {
		openFile(path);
		onClose();
	};

	return (
		<AutoFocusDialog
			onClose={onClose}
			onEntered={() => inputRef.current?.focus()}
		>
			<FilterInput
				autoFocus
				inputRef={inputRef}
				value={query}
				onChange={setQuery}
				onKeyDown={onKeyDown}
				placeholder="Search files by name..."
			/>
			<FilePaletteResults
				message={filePaletteMessage(worktreeCwd, query, search)}
				files={search.files}
				highlight={highlight}
				onHighlight={setHighlight}
				onSelect={select}
			/>
		</AutoFocusDialog>
	);
}
