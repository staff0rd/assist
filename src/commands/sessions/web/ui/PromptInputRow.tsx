import type { CSSProperties } from "react";
import { inputStyle, PLACEHOLDER, setFocusBorder } from "./isAssistMode";

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

export function PromptInputRow({
	prompt,
	setPrompt,
}: {
	prompt: string;
	setPrompt: (v: string) => void;
}) {
	return (
		<div style={{ display: "flex", gap: 8 }}>
			<input
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				placeholder={PLACEHOLDER}
				style={inputStyle}
				onFocus={(e) => setFocusBorder(e, "#007acc")}
				onBlur={(e) => setFocusBorder(e, "#555")}
			/>
			<button type="submit" style={submitStyle}>
				Start
			</button>
		</div>
	);
}
