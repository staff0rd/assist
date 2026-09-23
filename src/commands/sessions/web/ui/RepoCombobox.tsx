import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { RepoMenuList } from "./RepoMenuList";
import { repoComboboxSlotProps } from "./repoComboboxSlotProps";
import { useRepoCombobox } from "./useRepoCombobox";

const listSx = { maxHeight: 240, overflowY: "auto" } as const;

export function RepoCombobox({
	repos,
	value,
	onChange,
}: {
	repos: string[];
	value: string;
	onChange: (cwd: string) => void;
}) {
	const combo = useRepoCombobox(repos, value, onChange);

	return (
		<Box sx={{ flex: 1, minWidth: 0 }}>
			<TextField
				value={combo.text}
				onChange={(e) => combo.onType(e.target.value)}
				onFocus={(e) => {
					e.target.select();
					combo.onFocus();
				}}
				onBlur={combo.onBlur}
				onKeyDown={combo.onKeyDown}
				placeholder="Repo"
				size="small"
				fullWidth
				slotProps={repoComboboxSlotProps(combo.open, value)}
			/>
			{combo.open && (
				<Box sx={listSx} onMouseDown={(e) => e.preventDefault()}>
					<RepoMenuList
						repos={combo.filtered}
						selected={value}
						highlight={combo.highlight}
						onHighlight={combo.setHighlight}
						onSelect={combo.pick}
					/>
				</Box>
			)}
		</Box>
	);
}
