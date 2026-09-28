import { type RefObject, useEffect } from "react";
import { checkedRadio } from "../../checkedRadio";

export function useFocusCheckedOnChange(
	groupRef: RefObject<HTMLDivElement | null>,
	value: string,
) {
	useEffect(() => {
		const group = groupRef.current;
		if (!group?.contains(document.activeElement)) return;
		const checked = checkedRadio(group);
		if (checked && checked !== document.activeElement) checked.focus();
	}, [groupRef, value]);
}
