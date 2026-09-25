import { useState } from "react";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { DropdownWrapper } from "../../../DropdownWrapper";
import { FreePromptForm } from "../../../FreePromptForm";
import { harnessChoices } from "./PromptLaunchButton/harnessChoices";
import { HarnessRadio } from "./PromptLaunchButton/HarnessRadio";
import { useHarnessCapabilities } from "../../../../../useHarnessCapabilities";

export function PromptLaunchButton({
	cwd,
	disabled,
	onCreate,
	onCreateHarness,
}: {
	cwd: string;
	disabled: boolean;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd: string) => void;
}) {
	const choices = harnessChoices(useHarnessCapabilities());
	const [prompt, setPrompt] = useState("");
	const [harness, setHarness] = useState<HarnessKind>("claude");

	const launch = (text: string) => {
		if (harness === "claude") onCreate(text, cwd);
		else onCreateHarness(harness, text, cwd);
	};

	return (
		<DropdownWrapper
			label="prompt"
			disabled={disabled}
			onDefaultAction={() => launch("")}
		>
			{(close) => (
				<FreePromptForm
					value={prompt}
					onChange={setPrompt}
					header={
						choices.length > 1 ? (
							<HarnessRadio
								choices={choices}
								value={harness}
								onChange={setHarness}
							/>
						) : undefined
					}
					onSubmit={() => {
						launch(prompt);
						setPrompt("");
						close();
					}}
				/>
			)}
		</DropdownWrapper>
	);
}
