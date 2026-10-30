import type { ReactNode } from "react";
import { NativeHomeNodeGate } from "./HomeNodeGate/NativeHomeNodeGate";
import { isNativeApp } from "./isNativeApp";

export function HomeNodeGate({ children }: { children: ReactNode }) {
	if (!isNativeApp) return children;
	return <NativeHomeNodeGate>{children}</NativeHomeNodeGate>;
}
