import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { requestOpenInCode } from "./OpenInCodeButton/requestOpenInCode";
import { VsCodeIcon } from "./OpenInCodeButton/VsCodeIcon";
import type { ShortcutName } from "./shortcutRegistry";
import { useApiNode } from "../useApiNode";

export function OpenInCodeButton({
	cwd,
	variant = "toolbar",
	shortcut,
}: {
	cwd: string;
	variant?: "toolbar" | "card";
	shortcut?: ShortcutName;
}) {
	const [error, setError] = useState<string | null>(null);
	const isCard = variant === "card";
	const node = useApiNode();

	const button = (
		<ActionButton
			label="VS Code"
			title={shortcut ? "Open in VS Code" : undefined}
			ariaLabel="Open in VS Code"
			tone={isCard ? "muted" : "inherit"}
			size={isCard ? "small" : "medium"}
			disabled={!cwd}
			shortcut={shortcut}
			icon={<VsCodeIcon sx={isCard ? { fontSize: 14 } : undefined} />}
			onClick={(e) => {
				e.stopPropagation();
				void requestOpenInCode(cwd, node).then(
					(failure) => failure && setError(failure),
				);
			}}
		/>
	);

	return (
		<>
			{shortcut ? (
				button
			) : (
				<Tooltip title="Open in VS Code">
					<span>{button}</span>
				</Tooltip>
			)}
			<ErrorSnackbar error={error} onClose={() => setError(null)} />
		</>
	);
}
