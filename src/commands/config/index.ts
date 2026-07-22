import { stringify as stringifyYaml } from "yaml";
import { loadConfig } from "../../shared/loadConfig";

export function configList(): void {
	const config = loadConfig();
	console.log(stringifyYaml(config, { lineWidth: 0 }).trimEnd());
}
