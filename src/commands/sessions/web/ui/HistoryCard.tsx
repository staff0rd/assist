import type { CSSProperties, MouseEvent } from "react";
import { formatRelativeTime } from "./formatRelativeTime";
import type { HistoricalSession } from "./types";

const cardBase: CSSProperties = {
	display: "block",
	width: "100%",
	textAlign: "left",
	padding: "10px 12px",
	marginBottom: 4,
	borderRadius: 6,
	background: "#2d2d2d",
	border: "1px solid transparent",
	cursor: "pointer",
	transition: "background 0.15s",
	font: "inherit",
	color: "inherit",
};

const nameStyle: CSSProperties = {
	fontSize: 13,
	color: "#d4d4d4",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
};

const metaStyle: CSSProperties = {
	display: "flex",
	justifyContent: "space-between",
	marginTop: 4,
};

export function HistoryCard({
	session,
	onResume,
}: {
	session: HistoricalSession;
	onResume: (session: HistoricalSession) => void;
}) {
	const handleHover = (e: MouseEvent<HTMLButtonElement>, enter: boolean) => {
		e.currentTarget.style.background = enter ? "#333" : "#2d2d2d";
	};

	return (
		<button
			type="button"
			style={cardBase}
			onClick={() => onResume(session)}
			onMouseEnter={(e) => handleHover(e, true)}
			onMouseLeave={(e) => handleHover(e, false)}
		>
			<div style={nameStyle}>{session.name}</div>
			<div style={metaStyle}>
				<span style={{ fontSize: 11, color: "#569cd6" }}>
					{session.project}
				</span>
				<span style={{ fontSize: 11, color: "#888" }}>
					{formatRelativeTime(session.timestamp)}
				</span>
			</div>
		</button>
	);
}
