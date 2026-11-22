import { useCwdConfigured } from "./useCwdConfigured";

export function useAutopilotConfigured(cwd: string): boolean | undefined {
	return useCwdConfigured("/api/autopilot/configured", cwd);
}
