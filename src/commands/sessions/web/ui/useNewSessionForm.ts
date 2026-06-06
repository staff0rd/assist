import { type FormEvent, useEffect, useState } from "react";
import { dispatchMode, type SessionMode } from "./dispatchMode";
import { selectRun } from "./selectRun";
import { submitRunOrClaude } from "./submitRunOrClaude";
import type { RunConfigInfo } from "./types";
import { useRepoSelectionContext } from "./useRepoSelectionContext";
import { useRunFilter } from "./useRunFilter";

export type SessionFormState = ReturnType<typeof useNewSessionForm>;

export type FormDeps = {
	runConfigs: RunConfigInfo[];
	onCreate: (prompt: string, cwd: string) => void;
	onCreateRun: (name: string, args: string[], cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
	onRequestRunConfigs: (cwd: string) => void;
};

export function useNewSessionForm(deps: FormDeps) {
	const { runConfigs, onCreateRun, onRequestRunConfigs } = deps;
	const { selectedCwd } = useRepoSelectionContext();
	const [mode, setMode] = useState<SessionMode>("free");
	const [prompt, setPrompt] = useState("");
	const [selectedRun, setSelectedRun] = useState<string | null>(null);
	const [runParams, setRunParams] = useState<Record<string, string>>({});
	const filter = useRunFilter(runConfigs);

	useEffect(() => {
		if (selectedCwd) onRequestRunConfigs(selectedCwd);
	}, [selectedCwd, onRequestRunConfigs]);

	return {
		selectedCwd,
		mode,
		prompt,
		setPrompt,
		selectedRun,
		runParams,
		setRunParams,
		...filter,
		handleSelectRun(name: string | null) {
			setSelectedRun(selectRun(name, runConfigs, selectedCwd, onCreateRun));
			setRunParams({});
		},
		handleSelectMode(m: SessionMode) {
			setSelectedRun(null);
			dispatchMode(m, selectedCwd, deps.onCreateAssist, setMode);
		},
		handleSubmit(e: FormEvent) {
			e.preventDefault();
			if (!selectedCwd) return;
			const kind = submitRunOrClaude({
				selectedRun,
				runParams,
				prompt,
				cwd: selectedCwd,
				configs: runConfigs,
				onCreate: deps.onCreate,
				onCreateRun: deps.onCreateRun,
			});
			if (kind === "run") setRunParams({});
			else setPrompt("");
		},
	};
}
