import type { SessionMode } from "./buildPrompt";
import { ModeSelector } from "./ModeSelector";
import { PromptInputRow } from "./PromptInputRow";

export function SessionFormControls({
	hasRepo,
	mode,
	onSelectMode,
	prompt,
	setPrompt,
}: {
	hasRepo: boolean;
	mode: SessionMode;
	onSelectMode: (mode: SessionMode) => void;
	prompt: string;
	setPrompt: (v: string) => void;
}) {
	if (!hasRepo) {
		return (
			<div style={{ color: "#888", fontSize: 12, padding: "6px 0" }}>
				Select a repo above to create a session
			</div>
		);
	}

	return (
		<>
			<ModeSelector mode={mode} onSelect={onSelectMode} />
			<PromptInputRow mode={mode} prompt={prompt} setPrompt={setPrompt} />
		</>
	);
}
