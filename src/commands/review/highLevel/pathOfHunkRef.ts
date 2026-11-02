export function pathOfHunkRef(ref: string): string {
	return ref.slice(0, ref.lastIndexOf("#"));
}
