import type { CSSProperties } from "react";
import { inputStyle, PLACEHOLDERS, type SessionMode } from "./buildPrompt";

const submitStyle: CSSProperties = {
	padding: "6px 12px",
	background: "#007acc",
	border: "none",
	borderRadius: 4,
	color: "#fff",
	fontSize: 13,
	cursor: "pointer",
	whiteSpace: "nowrap",
};

function setFocusBorder(e: React.FocusEvent<HTMLInputElement>, color: string) {
	e.currentTarget.style.borderColor = color;
}

export function PromptInputRow({
	mode,
	prompt,
	setPrompt,
}: {
	mode: SessionMode;
	prompt: string;
	setPrompt: (v: string) => void;
}) {
	const showInput = mode !== "/next-backlog-item";

	return (
		<div style={{ display: "flex", gap: 8 }}>
			{showInput && (
				<input
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder={PLACEHOLDERS[mode]}
					style={inputStyle}
					onFocus={(e) => setFocusBorder(e, "#007acc")}
					onBlur={(e) => setFocusBorder(e, "#555")}
				/>
			)}
			<button
				type="submit"
				style={{ ...submitStyle, flex: showInput ? undefined : 1 }}
			>
				Start
			</button>
		</div>
	);
}
