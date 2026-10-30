const APP_ORIGIN = "capacitor://localhost";

export function isAppOrigin(origin: string | undefined): boolean {
	return origin === APP_ORIGIN;
}
