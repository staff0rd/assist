import { useGlobalConfigFlag } from "../../../../useGlobalConfigFlag";

export function useAskQuestionAutoSubmit(
	cwd: string | undefined,
): [boolean, (enabled: boolean) => void] {
	return useGlobalConfigFlag("sessions.askQuestionAutoSubmit", cwd);
}
