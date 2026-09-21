import Dialog from "@mui/material/Dialog";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { filePaletteMessage } from "./filePaletteMessage";
import { FilePaletteResults } from "./FilePaletteResults";
import { FilterInput } from "./FilterInput";
import { useFileSearch } from "./useFileSearch";
import { useListKeyboardNav } from "./useListKeyboardNav";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

const paperSx = { mt: 6, alignSelf: "flex-start" } as const;

export function FilePalette({ onClose }: { onClose: () => void }) {
	const { worktreeCwd } = useRepoSelectionContext();
	const [query, setQuery] = useState("");
	const search = useFileSearch(worktreeCwd, query);
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);

	const openFile = (path: string) =>
		navigate(
			`/file?${new URLSearchParams(
				worktreeCwd ? { path, cwd: worktreeCwd } : { path },
			)}`,
		);

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
		<Dialog
			open
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			slotProps={{
				paper: { sx: paperSx },
				transition: { onEntered: () => inputRef.current?.focus() },
			}}
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
		</Dialog>
	);
}
