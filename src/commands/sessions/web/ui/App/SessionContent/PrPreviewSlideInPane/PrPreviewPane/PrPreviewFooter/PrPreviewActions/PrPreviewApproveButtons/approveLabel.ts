export function approveLabel(shift: boolean, ctrl: boolean): string {
	if (!shift) return "Approve";
	return ctrl ? "Approve + start + yolo" : "Approve + start";
}
