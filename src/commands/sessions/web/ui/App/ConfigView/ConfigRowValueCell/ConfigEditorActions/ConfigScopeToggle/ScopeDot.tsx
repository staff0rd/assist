import Box from "@mui/material/Box";
import type { ConfigScope } from "../../saveConfigValue";

type DotState = "unset" | "overridden" | "effective";

const DOT_COLORS: Record<DotState, string> = {
	unset: "transparent",
	overridden: "text.disabled",
	effective: "success.main",
};

function dotState(
	scope: ConfigScope,
	scopesWithValue: ConfigScope[],
): DotState {
	if (!scopesWithValue.includes(scope)) return "unset";
	return scopesWithValue[0] === scope ? "effective" : "overridden";
}

export function ScopeDot({
	scope,
	scopesWithValue,
}: {
	scope: ConfigScope;
	scopesWithValue: ConfigScope[];
}) {
	const state = dotState(scope, scopesWithValue);
	return (
		<Box
			component="span"
			aria-hidden
			data-testid={`scope-dot-${scope}`}
			data-state={state}
			sx={{
				width: 6,
				height: 6,
				mr: 0.75,
				borderRadius: "50%",
				bgcolor: DOT_COLORS[state],
			}}
		/>
	);
}
