import Box from "@mui/material/Box";
import { useRef } from "react";
import { DropdownWrapper } from "../../../DropdownWrapper";
import { RepoList, repoName } from "../../../RepoList";
import { ChordTooltipTitle } from "../../ChordTooltipTitle";
import { useShortcut } from "../../useShortcut";
import { useFocusRepoPickerHotkey } from "./RepoPicker/useFocusRepoPickerHotkey";

const pickerSx = { width: 240, ml: 2 } as const;

export function RepoPicker({
	repos,
	selected,
	onSelect,
}: {
	repos: string[];
	selected: string;
	onSelect: (cwd: string) => void;
}) {
	const pickerRef = useRef<HTMLDivElement>(null);
	useFocusRepoPickerHotkey(pickerRef);
	const { chords } = useShortcut("focusRepoPicker");

	return (
		<Box ref={pickerRef} sx={pickerSx}>
			<DropdownWrapper
				label={selected ? repoName(selected) : "Select repo..."}
				tooltip={<ChordTooltipTitle label="Repo" chords={chords} />}
			>
				{(close) => (
					<RepoList
						repos={repos}
						selected={selected}
						onSelect={onSelect}
						close={close}
					/>
				)}
			</DropdownWrapper>
		</Box>
	);
}
