import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";

type DenyRule = { pattern: string; message: string };

export function loadDenyConfig(global?: boolean): {
	deny: DenyRule[];
	saveDeny: (deny: DenyRule[] | undefined) => void;
} {
	const config = global ? loadGlobalConfigRaw() : loadProjectConfig();
	const save = global ? saveGlobalConfig : saveConfig;
	const deny: DenyRule[] = (config.deny as DenyRule[]) ?? [];
	return {
		deny,
		saveDeny: (updated) => {
			config.deny = updated;
			save(config);
		},
	};
}
