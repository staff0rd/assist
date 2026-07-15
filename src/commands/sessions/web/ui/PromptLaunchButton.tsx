import Paper from "@mui/material/Paper";
import { FreePromptForm } from "./FreePromptForm";
import { PromptHarnessMenu } from "./PromptHarnessMenu";
import { PromptLaunchTrigger } from "./PromptLaunchTrigger";
import { useHarnessCapabilities } from "./useHarnessCapabilities";
import { usePromptLauncher } from "./usePromptLauncher";

type Launcher = (prompt: string, cwd: string) => void;

const wrapperSx = { position: "relative", border: "none", m: 0, p: 0 } as const;

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
	const l = usePromptLauncher(cwd, onCreate, onCreatePi);

	return (
		<Paper
			component="fieldset"
			variant="outlined"
			ref={l.wrapperRef}
			sx={wrapperSx}
			onBlur={l.handleBlur}
		>
			<PromptLaunchTrigger
				disabled={disabled}
				showCaret={exposePiActions}
				promptOpen={l.armed === "claude"}
				caretRef={l.caretRef}
				onPrompt={l.togglePrompt}
				onCaret={l.openMenu}
			/>
			{l.armed && (
				<FreePromptForm
					value={l.prompt}
					onChange={l.setPrompt}
					onSubmit={l.submit}
				/>
			)}
			<PromptHarnessMenu
				anchorEl={l.caretRef.current}
				open={l.menuOpen}
				onClose={l.closeMenu}
				onSelectPi={l.armPi}
			/>
		</Paper>
	);
}
