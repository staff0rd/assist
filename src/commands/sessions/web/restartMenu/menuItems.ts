type MenuAction = "restart-daemon" | "restart-webserver" | "restart-both";

export type MenuItem = {
	label: string;
	action: MenuAction;
	disabled?: boolean;
	note?: string;
};

export const menuItems: MenuItem[] = [
	{ label: "Restart daemon", action: "restart-daemon" },
	{ label: "Restart webserver", action: "restart-webserver" },
	{ label: "Restart both", action: "restart-both" },
];
