import { createContext, useContext } from "react";

export type SidebarCollapse = {
	collapsed: boolean;
	onToggleCollapsed: () => void;
};

export const SidebarCollapsedContext = createContext<SidebarCollapse>({
	collapsed: false,
	onToggleCollapsed: () => {},
});

export function useSidebarCollapsedContext(): SidebarCollapse {
	return useContext(SidebarCollapsedContext);
}
