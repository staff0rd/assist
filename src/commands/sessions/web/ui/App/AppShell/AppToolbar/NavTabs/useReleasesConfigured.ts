import { useCwdConfigured } from "./useCwdConfigured";

export function useReleasesConfigured(cwd: string): boolean | undefined {
	return useCwdConfigured("/api/releases/configured", cwd);
}
