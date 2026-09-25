import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { configScopeLabels } from "../configScopeLabels";
import { configScopeToggleTitle } from "./ConfigScopeToggle/configScopeToggleTitle";
import type { ConfigScope } from "../saveConfigValue";
import { ScopeDot } from "./ConfigScopeToggle/ScopeDot";

const SCOPES: ConfigScope[] = ["project", "repo", "global"];

type Props = {
	scope: ConfigScope;
	disabled: boolean;
	lockedToGlobal: boolean;
	scopesWithValue: ConfigScope[];
	repoKey?: string;
	globalConfigFile?: string;
	onChange: (scope: ConfigScope) => void;
};

export function ConfigScopeToggle({
	scope,
	disabled,
	lockedToGlobal,
	scopesWithValue,
	repoKey,
	globalConfigFile,
	onChange,
}: Props) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={scope}
			disabled={disabled}
			onChange={(_event, next: ConfigScope | null) => {
				if (next) onChange(next);
			}}
		>
			{SCOPES.map((candidate) => (
				<ToggleButton
					key={candidate}
					value={candidate}
					disabled={lockedToGlobal && candidate !== "global"}
					title={configScopeToggleTitle({
						scope: candidate,
						scopesWithValue,
						repoKey,
						globalConfigFile,
						lockedToGlobal,
						selected: candidate === scope,
					})}
				>
					<ScopeDot scope={candidate} scopesWithValue={scopesWithValue} />
					{configScopeLabels[candidate]}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
