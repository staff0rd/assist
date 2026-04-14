import type { CSSProperties } from "react";
import { dropdownStyle } from "./DropdownWrapper";

const itemStyle = (checked: boolean): CSSProperties => ({
	display: "flex",
	alignItems: "center",
	gap: 6,
	padding: "6px 8px",
	fontSize: 12,
	color: checked ? "#d4d4d4" : "#999",
	cursor: "pointer",
	background: "none",
	border: "none",
	width: "100%",
	textAlign: "left",
	font: "inherit",
});

const checkboxStyle = (checked: boolean): CSSProperties => ({
	width: 14,
	height: 14,
	border: "1px solid #555",
	borderRadius: 2,
	background: checked ? "#007acc" : "transparent",
	flexShrink: 0,
});

export function FilterDropdown({
	items,
	selected,
	onToggle,
}: {
	items: string[];
	selected: Set<string>;
	onToggle: (item: string) => void;
}) {
	return (
		<div style={dropdownStyle}>
			{items.map((item) => (
				<button
					type="button"
					key={item}
					style={itemStyle(selected.has(item))}
					onClick={() => onToggle(item)}
				>
					<span style={checkboxStyle(selected.has(item))} />
					{item}
				</button>
			))}
		</div>
	);
}
