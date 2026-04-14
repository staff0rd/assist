import type { CSSProperties } from "react";
import { dropdownStyleUp } from "./DropdownWrapper";

const itemStyle = (active: boolean): CSSProperties => ({
	display: "block",
	width: "100%",
	padding: "6px 8px",
	fontSize: 12,
	color: active ? "#fff" : "#ccc",
	background: active ? "#007acc" : "none",
	cursor: "pointer",
	border: "none",
	textAlign: "left",
	font: "inherit",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
});

export function repoName(cwd: string): string {
	const sep = cwd.includes("\\") ? "\\" : "/";
	return cwd.split(sep).filter(Boolean).pop() ?? cwd;
}

export function RepoList({
	repos,
	selected,
	onSelect,
	onCustom,
	close,
}: {
	repos: string[];
	selected: string;
	onSelect: (cwd: string) => void;
	onCustom: () => void;
	close: () => void;
}) {
	return (
		<div style={dropdownStyleUp}>
			{repos.map((cwd) => (
				<button
					type="button"
					key={cwd}
					style={itemStyle(cwd === selected)}
					title={cwd}
					onClick={() => {
						onSelect(cwd);
						close();
					}}
				>
					{repoName(cwd)}
				</button>
			))}
			<button
				type="button"
				style={{
					...itemStyle(false),
					borderTop: "1px solid #444",
					color: "#888",
					fontStyle: "italic",
				}}
				onClick={() => {
					close();
					onCustom();
				}}
			>
				Custom path...
			</button>
		</div>
	);
}
