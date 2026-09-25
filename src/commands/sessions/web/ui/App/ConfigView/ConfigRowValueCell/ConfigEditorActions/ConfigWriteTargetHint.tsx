import Typography from "@mui/material/Typography";
import { configScopeFiles } from "../configScopeFiles";
import type { ConfigScope } from "../saveConfigValue";

type Props = {
	scope: ConfigScope;
	repoKey: string | undefined;
	globalConfigFile: string | undefined;
};

export function ConfigWriteTargetHint({
	scope,
	repoKey,
	globalConfigFile,
}: Props) {
	return (
		<Typography
			variant="caption"
			color="text.secondary"
			data-testid="config-write-target"
		>
			This save writes to {configScopeFiles(repoKey, globalConfigFile)[scope]}.
			Dots mark where the saved value lives now.
		</Typography>
	);
}
