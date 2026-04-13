import { type FormEvent, useState } from "react";
import {
	buildPrompt,
	MODES,
	modeButtonStyle,
	type SessionMode,
} from "./buildPrompt";
import { PromptInputRow } from "./PromptInputRow";

export function NewSessionForm({
	onCreate,
}: {
	onCreate: (prompt: string) => void;
}) {
	const [mode, setMode] = useState<SessionMode>("free");
	const [prompt, setPrompt] = useState("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const text = prompt.trim();
		if (mode === "free" && !text) return;
		onCreate(buildPrompt(mode, text));
		setPrompt("");
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				padding: 12,
				borderTop: "1px solid #333",
				display: "flex",
				flexDirection: "column",
				gap: 8,
			}}
		>
			<div style={{ display: "flex", gap: 4 }}>
				{MODES.map((m) => (
					<button
						key={m.value}
						type="button"
						onClick={() => setMode(m.value)}
						style={modeButtonStyle(mode === m.value)}
					>
						{m.label}
					</button>
				))}
			</div>
			<PromptInputRow mode={mode} prompt={prompt} setPrompt={setPrompt} />
		</form>
	);
}
