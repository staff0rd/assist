import { createContext, useContext } from "react";
import type { Location } from "react-router";

type PhoneStackPage = {
	isCurrent: boolean;
	beneath?: Location;
	beneathLabel?: string;
};

export const PhoneStackPageContext = createContext<PhoneStackPage>({
	isCurrent: true,
});

export function usePhoneStackPage() {
	return useContext(PhoneStackPageContext);
}
