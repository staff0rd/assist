import { inputStyle, setFocusBorder } from "./isAssistMode";
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
				<input
					type="text"
					value={runFilter}
					onChange={(e) => onFilterChange(e.target.value)}
					placeholder="Filter runs..."
					style={inputStyle}
					onFocus={(e) => setFocusBorder(e, "#007acc")}
					onBlur={(e) => setFocusBorder(e, "#555")}
				/>
			)}
		</>
	);
}
