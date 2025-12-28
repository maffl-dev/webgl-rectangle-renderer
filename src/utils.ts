export function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(n, max));
}

export type Vec2 = {
	x: number,
	y: number
}

export type Rect = {
	pos: Vec2,
	size: Vec2,
	strokeWidth: number
}

export function setVec2(target: Vec2, source: Vec2): void {
	target.x = source.x;
	target.y = source.y;
}

export function panic(message: string): never {
	throw new Error(message)
}

export function echo(...args: any[]): void {
	console.log(...args)
}

export async function profile<T>(fn: () => T | Promise<T>): Promise<T> {
	const start = performance.now();
	const result = await fn();
	const diff = performance.now() - start;
	echo(diff);
	return result;
}

export function assert(condition: any, message: string = "Assertion failed"): asserts condition {
	if (!condition) {
		throw new Error(message)
	}
}

export function loadString(path: string): string {
	const request = new XMLHttpRequest();
	request.open('GET', path, false);  // false makes the request synchronous
	request.send(null);
	if (request.status === 200) {
		return request.responseText;
	} else {
		panic(`Failed to load file: ${path}`);
	}
}

// r, g, b, a
export type Color = [number, number, number, number];

// Colors
export const white = rgba(1, 1, 1);
export const black = rgba(0, 0, 0);
export const red = rgba(1, 0, 0);
export const green = rgba(0, 1, 0);
export const blue = rgba(0, 0, 1);
export const semiGreen = hex("0f0", 0.5);

export function rgba(r: number, g: number, b: number, a: number = 1): Color {
	return [r, g, b, a] as const;
}

export function rgba255(r: number, g: number, b: number, a: number = 1): Color {
	return [r / 255, g / 255, b / 255, a] as const;
}

// e.g. "#ff0000", "0f0" + optional alpha
export function hex(hex: string, alpha: number = 1): Color {
	const parsed = hex.startsWith('#') ? hex.slice(1) : hex;
	const bigint = parseInt(parsed, 16);

	let r = 0, g = 0, b = 0;

	if (parsed.length === 6) {
		r = (bigint >> 16) & 255;
		g = (bigint >> 8) & 255;
		b = bigint & 255;
	} else if (parsed.length === 3) {
		r = ((bigint >> 8) & 0xF) * 17;
		g = ((bigint >> 4) & 0xF) * 17;
		b = (bigint & 0xF) * 17;
	} else {
		throw new Error(`Invalid hex color: "${hex}"`);
	}

	return [r / 255, g / 255, b / 255, alpha] as const;
}
