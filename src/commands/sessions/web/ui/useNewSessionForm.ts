import { type FormEvent, useEffect, useState } from "react";
import type { SessionMode } from "./buildPrompt";
import { selectRun } from "./selectRun";
import { submitRunOrClaude } from "./submitRunOrClaude";
import type { RunConfigInfo } from "./types";
import { useRunFilter } from "./useRunFilter";

export type SessionFormState = ReturnType<typeof useNewSessionForm>;

type FormDeps = {
	runConfigs: RunConfigInfo[];
	selectedCwd: string;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateRun: (name: string, args: string[], cwd?: string) => void;
	onRequestRunConfigs: (cwd: string) => void;
};

export function useNewSessionForm(deps: FormDeps) {
	const { runConfigs, selectedCwd, onCreateRun, onRequestRunConfigs } = deps;
	const [mode, setMode] = useState<SessionMode>("free");
	const [prompt, setPrompt] = useState("");
	const [selectedRun, setSelectedRun] = useState<string | null>(null);
	const [runParams, setRunParams] = useState<Record<string, string>>({});
	const filter = useRunFilter(runConfigs);

	useEffect(() => {
		if (selectedCwd) onRequestRunConfigs(selectedCwd);
	}, [selectedCwd, onRequestRunConfigs]);

	const handleSelectRun = (name: string | null) => {
		setSelectedRun(selectRun(name, runConfigs, selectedCwd, onCreateRun));
		setRunParams({});
	};

	const handleSelectMode = (m: SessionMode) => {
		setSelectedRun(null);
		setMode(m);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!selectedCwd) return;
		const kind = submitRunOrClaude({
			...deps,
			selectedRun,
			runParams,
			mode,
			prompt,
			cwd: selectedCwd,
			configs: runConfigs,
		});
		if (kind === "run") setRunParams({});
		else setPrompt("");
	};

	return {
		mode,
		prompt,
		setPrompt,
		selectedRun,
		runParams,
		setRunParams,
		...filter,
		handleSelectRun,
		handleSelectMode,
		handleSubmit,
	};
}
