import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CONFIG_SCOPES_BY_PRECEDENCE } from "../../../../../../../config/ConfigWriteScope";
import { configScopeNames } from "../../../../../../../config/configScopeNames";
import { configScopeToggleTitle } from "./ConfigScopeToggle/configScopeToggleTitle";
import type { ConfigScope } from "../saveConfigValue";
import { ScopeDot } from "./ConfigScopeToggle/ScopeDot";

type Props = {
	scope: ConfigScope;
	disabled: boolean;
	writableScopes?: ConfigScope[];
	scopesWithValue: ConfigScope[];
	repoKey?: string;
	globalConfigFile?: string;
	onChange: (scope: ConfigScope) => void;
};

export function ConfigScopeToggle({
	scope,
	disabled,
	writableScopes,
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
			{CONFIG_SCOPES_BY_PRECEDENCE.map((candidate) => (
				<ToggleButton
					key={candidate}
					value={candidate}
					disabled={
						writableScopes !== undefined && !writableScopes.includes(candidate)
					}
					title={configScopeToggleTitle({
						scope: candidate,
						scopesWithValue,
						repoKey,
						globalConfigFile,
						writableScopes,
						selected: candidate === scope,
					})}
				>
					<ScopeDot scope={candidate} scopesWithValue={scopesWithValue} />
					{configScopeNames[candidate]}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
