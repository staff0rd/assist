import type { KeyboardEvent } from "react";
import type { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import { sdkComposerKeyDown } from "./sdkComposerKeyDown";
import type { useComposerShell } from "./useComposerShell";

type Keys = {
	text: string;
	shell: ReturnType<typeof useComposerShell>;
	slash: ReturnType<typeof useSlashSuggestions>;
	suggestion: string | undefined;
	running: boolean;
	send: () => void;
	stop: () => void;
};

export function sdkComposerOnKeyDown({ text, shell, ...keys }: Keys) {
	return (e: KeyboardEvent) =>
		shell.leaveOnBackspace(e, text) ||
		sdkComposerKeyDown(e, { ...keys, stopShell: shell.stopRunning });
}
