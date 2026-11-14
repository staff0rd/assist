import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import IconButton from "@mui/material/IconButton";
import { useLocation, useNavigate } from "react-router";
import { usePhoneStackPage } from "./PhoneNavStack/usePhoneStackPage";
import { owningPhoneTab } from "./PhoneTabBar/owningPhoneTab";
import { phoneTabs } from "./PhoneTabBar/phoneTabs";
import { useEdgeSwipeBack } from "./useEdgeSwipeBack";

const backSx = { color: "primary.main" } as const;

export function PhoneBackButton() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { isCurrent, beneath, beneathLabel } = usePhoneStackPage();
	const root = owningPhoneTab(pathname);
	const goBack = () =>
		beneath
			? navigate(-1)
			: navigate(root, { replace: true, state: { phoneBack: true } });
	useEdgeSwipeBack(goBack, isCurrent);
	const label =
		(beneath && beneathLabel) ??
		phoneTabs.find(({ path }) => path === root)?.label;
	return (
		<IconButton aria-label={`Back to ${label}`} sx={backSx} onClick={goBack}>
			<ChevronLeftIcon />
		</IconButton>
	);
}
