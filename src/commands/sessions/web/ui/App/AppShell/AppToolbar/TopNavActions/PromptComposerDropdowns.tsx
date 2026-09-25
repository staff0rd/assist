import { FreePromptDropdown } from "./FreePromptDropdown";
import { PromptLaunchButton } from "./PromptComposerDropdowns/PromptLaunchButton";

export function PromptComposerDropdowns({
	cwd,
	disabled,
	onCreate,
	onCreateDesign,
	onCreateHarness,
}: {
	cwd: string;
	disabled: boolean;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateDesign: (prompt: string, cwd: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd: string) => void;
}) {
	return (
		<>
			<PromptLaunchButton
				cwd={cwd}
				disabled={disabled}
				onCreate={onCreate}
				onCreateHarness={onCreateHarness}
			/>
			<FreePromptDropdown
				label="design"
				allowEmpty
				disabled={disabled}
				onSubmit={(prompt) => onCreateDesign(prompt, cwd)}
			/>
		</>
	);
}
