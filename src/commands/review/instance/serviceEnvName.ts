export function serviceEnvName(service: string): string {
	return service.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}
