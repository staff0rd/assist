import type { PaletteMode, SimplePaletteColorOptions } from "@mui/material";
import type { ITheme } from "@xterm/xterm";

type ChromeColors = {
	secondary: string;
	hover: string;
	active: string;
	dot: string;
	dotRing: string;
	level: { ok: string; warn: string; over: string };
};

type StatusBarColors = ChromeColors & {
	background: string;
	text: string;
	hoverText: string;
	readyText: string;
};

type ColorTokens = {
	background: string;
	surface: string;
	raised: string;
	line: string;
	lineSoft: string;
	text: { primary: string; secondary: string; disabled: string };
	selected: string;
	wash: { warning: string; error: string };
	well: string;
	stripe: string;
	codeWash: string;
	overlay: { background: string; text: string };
	scrim: string;
	appBar?: { background: string; text: string };
	onAppBar: ChromeColors;
	statusBar: StatusBarColors;
	primary: SimplePaletteColorOptions;
	secondary: SimplePaletteColorOptions;
	success: SimplePaletteColorOptions;
	warning: SimplePaletteColorOptions;
	error: SimplePaletteColorOptions;
	info: SimplePaletteColorOptions;
};

type ElevationTokens = {
	appBar: number;
	overlay: string;
	dialog: string;
	stuckHeader: string;
};

type ModeTokens = {
	color: ColorTokens;
	terminal: ITheme;
	elevation: ElevationTokens;
};

type TypeScale = {
	caption: number;
	body2: number;
	body1: number;
	subtitle2: number;
	subtitle1: number;
	h6: number;
	h5: number;
	h4: number;
	button: number;
};

export type Density = "desktop" | "touch";

type DensityTokens = {
	target: number;
	bar: number;
	iconButton: {
		side: number;
		icon: number;
		smallSide: number;
		smallIcon: number;
	};
	button: { minHeight: number; fontSize: number; paddingX: number };
	switch: { width: number; height: number; thumb: number };
	inputFontSize: number;
	tabBar: { height: number; icon: number; label: number; badge: number };
};

export type DesignTokens = {
	dark: ModeTokens;
	light: ModeTokens;
	font: { ui: string; mono: string; terminal: string };
	type: {
		fontSize: number;
		terminalFontSize: number;
		scale: TypeScale;
		button: { textTransform: "none"; fontWeight: number };
	};
	radius: { sm: number; md: number };
	spacing: number;
	densities: Record<Density, DensityTokens>;
};

export type ActiveTokens = Omit<DesignTokens, "dark" | "light" | "densities"> &
	ModeTokens & { mode: PaletteMode; density: DensityTokens };
