import Stack from "@mui/material/Stack";
import { ConfigEnumInput } from "../../ConfigEnumInput";
import { ConfigListInput } from "../../ConfigListInput";
import type { ConfigNodeEditorProps } from "../../ConfigNodeEditorRenderer";
import { ConfigTextInput } from "../../ConfigTextInput";

const MODES = {
	"auto-detect": true,
	off: false,
	command: "",
	paths: [] as string[],
};

type InstallMode = keyof typeof MODES;

function installModeOf(value: unknown): InstallMode {
	if (value === false) return "off";
	if (typeof value === "string") return "command";
	if (Array.isArray(value)) return "paths";
	return "auto-detect";
}

export function ConfigInstallModeEditor({
	label,
	value,
	disabled,
	onChange,
}: ConfigNodeEditorProps) {
	const mode = installModeOf(value);

	return (
		<Stack spacing={0.5}>
			<ConfigEnumInput
				label={`${label} mode`}
				options={Object.keys(MODES)}
				value={mode}
				disabled={disabled}
				onChange={(next) => onChange(MODES[next as InstallMode])}
			/>
			{mode === "command" && (
				<ConfigTextInput
					label={label}
					value={String(value)}
					numeric={false}
					helperText="run at the worktree root"
					disabled={disabled}
					onChange={onChange}
				/>
			)}
			{mode === "paths" && (
				<ConfigListInput
					label={label}
					value={value}
					disabled={disabled}
					onChange={onChange}
				/>
			)}
		</Stack>
	);
}
