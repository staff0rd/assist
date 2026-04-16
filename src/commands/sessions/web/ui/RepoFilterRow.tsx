import TextField from "@mui/material/TextField";
import { RepoPicker } from "./RepoPicker";

export function RepoFilterRow({
	repos,
	selectedCwd,
	onSelectCwd,
	runFilter,
	onFilterChange,
	showFilter,
}: {
	repos: string[];
	selectedCwd: string;
	onSelectCwd: (cwd: string) => void;
	runFilter: string;
	onFilterChange: (v: string) => void;
	showFilter: boolean;
}) {
	return (
		<>
			<RepoPicker repos={repos} selected={selectedCwd} onSelect={onSelectCwd} />
			{showFilter && (
				<TextField
					value={runFilter}
					onChange={(e) => onFilterChange(e.target.value)}
					placeholder="Filter runs..."
					size="small"
					fullWidth
					slotProps={{ input: { sx: { fontSize: 13 } } }}
				/>
			)}
		</>
	);
}
