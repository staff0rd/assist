import type { CSSProperties } from "react";
import type { SessionStatus } from "./types";

const STATUS_COLORS: Record<SessionStatus, string> = {
	running: "#4ec9b0",
	waiting: "#dcdcaa",
	done: "#569cd6",
};

const nameStyle: CSSProperties = {
	fontSize: 13,
	color: "#d4d4d4",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	flex: 1,
};

export function cardStyle(active: boolean): CSSProperties {
	return {
		display: "block",
		width: "100%",
		textAlign: "left",
		padding: "10px 12px",
		marginBottom: 4,
		borderRadius: 6,
		background: active ? "#37373d" : "#2d2d2d",
		border: active ? "1px solid #007acc" : "1px solid transparent",
		cursor: "pointer",
		transition: "background 0.15s",
		font: "inherit",
		color: "inherit",
	};
}

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onDismiss();
			}}
			style={{
				background: "none",
				border: "none",
				color: "#888",
				cursor: "pointer",
				fontSize: 16,
				lineHeight: 1,
				padding: "0 2px",
			}}
			title="Dismiss"
		>
			×
		</button>
	);
}

export function StatusRow({
	status,
	elapsed,
}: {
	status: SessionStatus;
	elapsed: string;
}) {
	return (
		<div
			style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}
		>
			<span style={{ fontSize: 11, color: STATUS_COLORS[status] }}>
				● {status}
			</span>
			<span style={{ fontSize: 11, color: "#888" }}>{elapsed}</span>
		</div>
	);
}

export function CardHeader({
	name,
	isDone,
	onDismiss,
}: {
	name: string;
	isDone: boolean;
	onDismiss: () => void;
}) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<span style={nameStyle}>{name}</span>
			{isDone && <DismissButton onDismiss={onDismiss} />}
		</div>
	);
}
