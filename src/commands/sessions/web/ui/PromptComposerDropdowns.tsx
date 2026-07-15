import { FreePromptDropdown } from "./FreePromptDropdown";
import { PromptLaunchButton } from "./PromptLaunchButton";

export function PromptComposerDropdowns({
	cwd,
	disabled,
	onCreate,
	onCreateDesign,
	onCreatePi,
}: {
	cwd: string;
	disabled: boolean;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateDesign: (prompt: string, cwd: string) => void;
	onCreatePi: (prompt: string, cwd: string) => void;
}) {
	return (
		<>
			<PromptLaunchButton
				cwd={cwd}
				disabled={disabled}
				onCreate={onCreate}
				onCreatePi={onCreatePi}
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
