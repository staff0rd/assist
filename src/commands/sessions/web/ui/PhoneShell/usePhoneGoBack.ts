import { useLocation, useNavigate } from "react-router";
import { usePhoneStackPage } from "./PhoneNavStack/usePhoneStackPage";
import { owningPhoneTab } from "./PhoneTabBar/owningPhoneTab";
import { phoneTabs } from "./PhoneTabBar/phoneTabs";

export function usePhoneGoBack() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { beneath, beneathLabel } = usePhoneStackPage();
	const root = owningPhoneTab(pathname);
	const goBack = () =>
		beneath
			? navigate(-1)
			: navigate(root, { replace: true, state: { phoneBack: true } });
	const label =
		(beneath && beneathLabel) ??
		phoneTabs.find(({ path }) => path === root)?.label;
	return { goBack, label };
}
