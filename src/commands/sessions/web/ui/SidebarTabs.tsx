import type { CSSProperties } from "react";
import type { SidebarTab } from "./types";

const tabStyle = (active: boolean): CSSProperties => ({
	flex: 1,
	padding: "8px 0",
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: 0.5,
	textTransform: "uppercase",
	color: active ? "#ccc" : "#666",
	background: "none",
	border: "none",
	borderBottom: active ? "2px solid #007acc" : "2px solid transparent",
	cursor: "pointer",
	font: "inherit",
});

const countStyle: CSSProperties = { color: "#666", fontWeight: 400 };

export function SidebarTabs({
	tab,
	activeCount,
	historyCount,
	onChange,
}: {
	tab: SidebarTab;
	activeCount: number;
	historyCount: number;
	onChange: (tab: SidebarTab) => void;
}) {
	return (
		<div style={{ display: "flex", borderBottom: "1px solid #333" }}>
			<button
				type="button"
				style={tabStyle(tab === "active")}
				onClick={() => onChange("active")}
			>
				Active <span style={countStyle}>{activeCount}</span>
			</button>
			<button
				type="button"
				style={tabStyle(tab === "history")}
				onClick={() => onChange("history")}
			>
				History <span style={countStyle}>{historyCount}</span>
			</button>
		</div>
	);
}
