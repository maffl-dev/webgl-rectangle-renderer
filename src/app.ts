import { assert, clamp, hex, Vec2 } from "./utils"
import { type Renderer } from "./renderer"

export class App {
	lastTime: number = 0

	renderer: Renderer
	updateFunc: (dt: number) => void
	renderFunc: (ren: Renderer) => void

	mouse: Vec2 = { x: 0, y: 0 }
	private mouseIsDown: boolean = false;
	private mouseWheelDeltaY: number = 0.0;

	constructor(
		ren: Renderer,
		updateFunc: (dt: number) => void,
		renderFunc: (ren: Renderer) => void,
		canvas: HTMLCanvasElement
	) {
		this.renderer = ren
		assert(this.renderer)
		this.lastTime = performance.now()
		this.updateFunc = updateFunc;
		this.renderFunc = renderFunc;

		// register input
		window.addEventListener("mousemove", (e) => {
			const rect = canvas.getBoundingClientRect();
			this.mouse.x = e.clientX - rect.left;
			this.mouse.y = e.clientY - rect.top;
		});
		window.addEventListener("mousedown", (e) => {
			if (e.button === 0) this.mouseIsDown = true;
		});
		window.addEventListener("mouseup", (e) => {
			if (e.button === 0) this.mouseIsDown = false;
		});
		window.addEventListener("wheel", (e) => {
			let scale = 1;
			switch (e.deltaMode) {
				case WheelEvent.DOM_DELTA_LINE:
					scale = 16;
					break;
				case WheelEvent.DOM_DELTA_PAGE:
					scale = canvas.clientHeight || 800;
					break;
			}
			this.mouseWheelDeltaY = e.deltaY * scale;
		});
	}

	run = () => {
		requestAnimationFrame(this.loop)
	}

	loop = (time: number) => {
		let dt: number = (time - this.lastTime) / 1000.0;
		dt = clamp(dt, 0.001, 0.1);
		this.lastTime = time

		this.update(dt)
		this.render()

		requestAnimationFrame(this.loop)
	}

	update(dt: number) {
		this.updateFunc(dt);
		this.mouseWheelDeltaY = 0.0;
	}

	render() {
		const bgColor = hex("#2f324d");
		this.renderer.beginFrame(bgColor)
		this.renderFunc(this.renderer);
		this.renderer.endFrame()

		// metrics
		const metricsContainer: HTMLDivElement = document.getElementById("metrics") as HTMLDivElement;
		const metrics = {
			...this.renderer.getMetrics(),
			rectangles: this.renderer.getMetrics().triangleCount / 2
		}
		metricsContainer.innerText = Object.entries(metrics).map(([key, val]) => {
			if (key.indexOf("Time") !== -1) {
				return key + ": " + Number(val).toFixed(2) + " ms"
			} else {
				return key + ": " + Number(val).toFixed(0)
			}
		}).join("\n");
	}


	mouseDown(): boolean {
		return this.mouseIsDown
	}

	mouseX(): number {
		return this.mouse.x
	}

	mouseY(): number {
		return this.mouse.x
	}

	mouseWheel(): number {
		return this.mouseWheelDeltaY
	}

}
