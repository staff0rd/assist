import { useState } from "react";
import { DropdownWrapper } from "./DropdownWrapper";
import { FreePromptForm } from "./FreePromptForm";

export function FreePromptDropdown({
	disabled,
	onSubmit,
	label = "prompt",
	allowEmpty = false,
}: {
	disabled: boolean;
	onSubmit: (prompt: string) => void;
	label?: string;
	allowEmpty?: boolean;
}) {
	const [prompt, setPrompt] = useState("");

	return (
		<DropdownWrapper label={label} disabled={disabled}>
			{(close) => (
				<FreePromptForm
					value={prompt}
					onChange={setPrompt}
					onSubmit={() => {
						if (!allowEmpty && !prompt.trim()) return;
						onSubmit(prompt);
						setPrompt("");
						close();
					}}
				/>
			)}
		</DropdownWrapper>
	);
}
