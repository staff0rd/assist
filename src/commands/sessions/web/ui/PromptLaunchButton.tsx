import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useState } from "react";
import { DropdownWrapper } from "./DropdownWrapper";
import { FreePromptForm } from "./FreePromptForm";
import { useHarnessCapabilities } from "./useHarnessCapabilities";

type Launcher = (prompt: string, cwd: string) => void;
type Harness = "claude" | "pi";

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

function HarnessRadio({
	value,
	onChange,
}: {
	value: Harness;
	onChange: (harness: Harness) => void;
}) {
	return (
		<RadioGroup
			row
			value={value}
			onChange={(e) => onChange(e.target.value as Harness)}
		>
			<FormControlLabel
				value="claude"
				control={<Radio size="small" />}
				label="claude"
				sx={labelSx}
			/>
			<FormControlLabel
				value="pi"
				control={<Radio size="small" />}
				label="pi"
				sx={labelSx}
			/>
		</RadioGroup>
	);
}

export function PromptLaunchButton({
	cwd,
	disabled,
	onCreate,
	onCreatePi,
}: {
	cwd: string;
	disabled: boolean;
	onCreate: Launcher;
	onCreatePi: Launcher;
}) {
	const { exposePiActions } = useHarnessCapabilities();
	const [prompt, setPrompt] = useState("");
	const [harness, setHarness] = useState<Harness>("claude");

	return (
		<DropdownWrapper label="prompt" disabled={disabled}>
			{(close) => (
				<FreePromptForm
					value={prompt}
					onChange={setPrompt}
					header={
						exposePiActions ? (
							<HarnessRadio value={harness} onChange={setHarness} />
						) : undefined
					}
					onSubmit={() => {
						(harness === "pi" ? onCreatePi : onCreate)(prompt, cwd);
						setPrompt("");
						setHarness("claude");
						close();
					}}
				/>
			)}
		</DropdownWrapper>
	);
}
