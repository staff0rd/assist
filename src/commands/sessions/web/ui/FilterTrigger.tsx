import type { CSSProperties } from "react";

const buttonStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 4,
	padding: "4px 8px",
	fontSize: 11,
	color: "#ccc",
	background: "#333",
	border: "1px solid #444",
	borderRadius: 4,
	cursor: "pointer",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	maxWidth: "100%",
	font: "inherit",
};

export function FilterTrigger({
	label,
	open,
	onClick,
}: {
	label: string;
	open: boolean;
	onClick: () => void;
}) {
	return (
		<button type="button" style={buttonStyle} onClick={onClick}>
			<span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
				{label}
			</span>
			<span style={{ fontSize: 9 }}>{open ? "\u25B2" : "\u25BC"}</span>
		</button>
	);
}
