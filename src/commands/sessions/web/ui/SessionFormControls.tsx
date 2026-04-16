import { isAssistMode } from "./isAssistMode";
import { ModeSelector } from "./ModeSelector";
import { PromptInputRow } from "./PromptInputRow";
import { RunParamInputs } from "./RunParamInputs";
import type { SessionFormState } from "./useNewSessionForm";

export function SessionFormControls({
	form,
	totalRunCount,
}: {
	form: SessionFormState;
	totalRunCount: number;
}) {
	const activeConfig = form.selectedRun
		? form.filteredRunConfigs.find((c) => c.name === form.selectedRun)
		: null;

	const showPrompt = !isAssistMode(form.mode) && !form.selectedRun;

	return (
		<>
			<ModeSelector
				mode={form.mode}
				onSelectMode={form.handleSelectMode}
				runConfigs={form.filteredRunConfigs}
				totalRunCount={totalRunCount}
				selectedRun={form.selectedRun}
				onSelectRun={form.handleSelectRun}
			/>
			{form.selectedRun && activeConfig ? (
				<RunParamInputs
					config={activeConfig}
					values={form.runParams}
					onChange={form.setRunParams}
				/>
			) : showPrompt ? (
				<PromptInputRow prompt={form.prompt} setPrompt={form.setPrompt} />
			) : null}
		</>
	);
}
