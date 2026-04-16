import { modeButtonStyle } from "./isAssistMode";
import type { RunConfigInfo } from "./types";

function hasParams(c: RunConfigInfo): boolean {
	return (c.params?.length ?? 0) > 0;
}

export function RunButton({
	config,
	active,
	onClick,
}: {
	config: RunConfigInfo;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button type="button" onClick={onClick} style={modeButtonStyle(active)}>
			{!hasParams(config) && "\u25b6 "}
			{config.name}
		</button>
	);
}
