/// <reference types="vite/client" />

import { App } from "./app";
import { Renderer, WebGLRenderer } from "./renderer";
import { clamp, setVec2, type Rect, type Vec2 } from "./utils";

import fragment from '/public/shaders/default.fs'; // import for hot reloading

let app!: App;

function main() {
	const canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement;
	const appDiv = document.getElementById("app");
	appDiv!.prepend(canvas);
	const renderer = new WebGLRenderer(canvas);
	app = new App(renderer, update, render, canvas);
	init(renderer);
	app.run();
}

const NR_OF_RECTANGLES = 50000;
const WORLD_SIZE_IN_PX = 30000;

const objects: Rect[] = new Array(NR_OF_RECTANGLES);
let camera: Vec2 = { x: 0.0, y: 0.0 } // world space
let zoom: number = 1.0;
let isDragging: boolean = false;
let dragStartMouse: Vec2 = { x: 0.0, y: 0.0 }; // screen space
let dragStartCamera: Vec2 = { x: 0.0, y: 0.0 }; // world space

main();

function init(r: Renderer) {
	camera.x = WORLD_SIZE_IN_PX / 2;
	camera.y = WORLD_SIZE_IN_PX / 2;

	// 1 of 4 sizes, will be chosen randomly on initilization
	const rectSizes = [
		{ w: 100, h: 35 },
		{ w: 40, h: 40 },
		{ w: 80, h: 80 },
		{ w: 40, h: 80 },
	]
	for (let i = 0; i < objects.length; i++) {
		const sizeIndex = i % rectSizes.length;
		objects[i] = {
			pos: {
				x: Math.random() * WORLD_SIZE_IN_PX,
				y: Math.random() * WORLD_SIZE_IN_PX,
			},
			size: {
				x: rectSizes[sizeIndex].w,
				y: rectSizes[sizeIndex].h
			},
			strokeWidth: i % 2 == 0 ? 2 : 1 + Math.floor(Math.random() * 4.0)
		}
	}

	r.setColor(0.5, 0.5, 0.8)
	r.buildStaticGeometry(objects);
}


function update(dt: number) {
	// pan
	if (app.mouseDown()) {
		if (!isDragging) {
			isDragging = true;
			setVec2(dragStartCamera, camera)
			setVec2(dragStartMouse, app.mouse)
		} else {
			const deltaScreenX = app.mouse.x - dragStartMouse.x;
			const deltaScreenY = app.mouse.y - dragStartMouse.y;
			const deltaWorldX = deltaScreenX / zoom;
			const deltaWorldY = deltaScreenY / zoom;
			camera.x = dragStartCamera.x - deltaWorldX;
			camera.y = dragStartCamera.y - deltaWorldY;
		}
	} else {
		isDragging = false;
	}

	// zoom
	if (app.mouseWheel()) {
		const prevWorldPos = getWorldPos(app.mouse);

		const zoomSpeed = 2.0;
		const zoomFactor = 1.0 - (app.mouseWheel() * 0.001 * zoomSpeed);
		zoom *= zoomFactor;
		zoom = clamp(zoom, 0.02, 10.0);

		// if zoom changed, world-position will be different now,
		// so we need to adjust the camera
		const worldPosAfterZoom = getWorldPos(app.mouse);
		camera.x += prevWorldPos.x - worldPosAfterZoom.x;
		camera.y += prevWorldPos.y - worldPosAfterZoom.y;
	}
}

function render(r: Renderer) {
	r.scale(zoom, zoom)
	r.translate(-camera.x, -camera.y);

	r.drawStaticGeometry();

	// dynamic drawing
	if (false) {
		r.setColor(0.5, 0.5, 0.8)
		for (let i = 0; i < objects.length; i++) {
			const rect = objects[i];
			r.drawRect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y)
		}
	}
}

function getWorldPos(point: Vec2): Vec2 {
	return {
		x: camera.x + (point.x / zoom),
		y: camera.y + (point.y / zoom)
	}
}
