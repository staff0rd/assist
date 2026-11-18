import { useGlobalConfigValue } from "./useGlobalConfigValue";

const parseFlag = (raw: unknown) => raw === true;

export function useGlobalConfigFlag(
	key: string,
	cwd: string | undefined,
	localOnly = false,
): [boolean, (enabled: boolean) => void] {
	return useGlobalConfigValue(key, cwd, parseFlag, localOnly);
}
