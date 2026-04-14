import { type FormEvent, useState } from "react";
import type { SessionMode } from "./buildPrompt";
import { RepoPicker } from "./RepoPicker";
import { SessionFormControls } from "./SessionFormControls";
import { submitSession } from "./submitSession";
import type { HistoricalSession } from "./types";
import { useRepoSelection } from "./useRepoSelection";

export function NewSessionForm({
	currentCwd,
	history,
	onCreate,
}: {
	currentCwd: string;
	history: HistoricalSession[];
	onCreate: (prompt: string, cwd: string) => void;
}) {
	const [mode, setMode] = useState<SessionMode>("free");
	const [prompt, setPrompt] = useState("");
	const { repos, selectedCwd, setSelectedCwd } = useRepoSelection(
		currentCwd,
		history,
	);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!selectedCwd) return;
		submitSession(mode, prompt, selectedCwd, onCreate);
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
			<RepoPicker
				repos={repos}
				selected={selectedCwd}
				onSelect={setSelectedCwd}
			/>
			<SessionFormControls
				hasRepo={selectedCwd !== ""}
				mode={mode}
				onSelectMode={setMode}
				prompt={prompt}
				setPrompt={setPrompt}
			/>
		</form>
	);
}
