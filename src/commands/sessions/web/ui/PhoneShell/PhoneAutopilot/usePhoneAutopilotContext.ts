import { createContext, useContext } from "react";
import type { PhoneAutopilot } from "./usePhoneAutopilot";

export const PhoneAutopilotContext = createContext<PhoneAutopilot | null>(null);

export function usePhoneAutopilotContext(): PhoneAutopilot | null {
	return useContext(PhoneAutopilotContext);
}
