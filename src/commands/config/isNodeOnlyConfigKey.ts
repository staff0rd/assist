import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";

export function isNodeOnlyConfigKey(key: string): boolean {
	return isGlobalOnlyConfigKey(key) || key.split(".")[0] === "repos";
}
