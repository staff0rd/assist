import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { type RefObject, useRef } from "react";
import { RepoMenuList } from "../../../RepoMenuList";
import { RepoComboboxPopper } from "./RepoCombobox/RepoComboboxPopper";
import { repoComboboxSlotProps } from "./RepoCombobox/repoComboboxSlotProps";
import { useRepoCombobox } from "./RepoCombobox/useRepoCombobox";

export function RepoCombobox({
	repos,
	value,
	onChange,
	inputRef,
	autoFocus,
	onTrack,
}: {
	repos: string[];
	value: string;
	onChange: (cwd: string) => void;
	inputRef: RefObject<HTMLInputElement | null>;
	autoFocus: boolean;
	onTrack: () => void;
}) {
	const combo = useRepoCombobox(repos, value, onChange);
	const anchorRef = useRef<HTMLDivElement>(null);

	return (
		<Box ref={anchorRef} sx={{ flex: 1, minWidth: 0 }}>
			<TextField
				value={combo.text}
				onChange={(e) => combo.onType(e.target.value)}
				onFocus={(e) => {
					e.target.select();
					combo.onFocus();
					onTrack();
				}}
				inputRef={inputRef}
				autoFocus={autoFocus}
				onClick={combo.onClick}
				onBlur={combo.onBlur}
				onKeyDown={combo.onKeyDown}
				placeholder="Repo"
				size="small"
				fullWidth
				slotProps={repoComboboxSlotProps(combo.open)}
			/>
			<RepoComboboxPopper open={combo.open} anchor={anchorRef.current}>
				<RepoMenuList
					repos={combo.filtered}
					selected={value}
					highlight={combo.highlight}
					onHighlight={combo.setHighlight}
					onSelect={combo.pick}
				/>
			</RepoComboboxPopper>
		</Box>
	);
}
