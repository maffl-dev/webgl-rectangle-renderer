# WebGL Rectangle Renderer

A static 2D rectangle renderer built with WebGL:
- Draws 50k rectangles in ~1ms (Macbook Air M3)
- Zoom-invariant strokes 
- diagonal hatch pattern 

**Demo**:
https://webgl-rectangle-renderer-strokes.vercel.app

<img width="578" height="535" alt="screenshot" src="https://github.com/user-attachments/assets/1e971118-d151-4027-8937-77dcb0519b95" />

The main logic lives inside `src/main.ts`.
The renderer used is slightly modified version of my [Blitz-GL Renderer](https://github.com/maffl-dev/blitz-gl/tree/master). Two important functions I added to the renderer are `drawStaticGeometry` and `drawStaticGeometry`.

# Zoom/Pan Approach

## Panning
- On drag start, we save mouse (screen-space) and camera (world-space) position
- When dragging, we calc the distance the user dragged in screen-space
- We convert this distance to world-space by dividing through zoom
- Then we take that delta and add it to our saved camera position

## Zooming
Zooming is cursor-centered to keep the world point under the cursor stationary:
- We save world position
- Calc new zoom value (in direction of scrollwheel)
- Calc world position again: if zoom has changed this will be different now
- Calc delta between previous and new world position
- Add this delta to camera position
We are basically correcting the camera position, so the cursor stays in the same place in world position.

## Camera Transform
The camera matrix combines zoom (scale) and pan (translation):
```typescript
r.scale(zoom, zoom);
r.translate(-camera.x, -camera.y);
````
- This creates the transform matrix: `Transform = scale(zoom) × translate(-camera)`
- Uploaded as `mat3` uniform to vertex shader (set in `drawStaticGeometry()`)
- GPU transforms all geometry with a single draw call

## How stroke invariance works
Strokes remain constant in screen pixels regardless of zoom by converting stroke width to world-space before rendering.

**In the fragment shader we do:**
```glsl
float strokeWorldWidth = strokeWidthInPixels / zoom;
```

Stroke width is passed as a vertex attribute, to allow varying it per rectangle, while still maintaining batching (no flush / single drawcall).


# Performance

## Initial approach
I started with a dynamic re-drawing of all 50k rectangles every frame (as I did in my game).
This rebuilds the vertex buffer each frame and uploads it to the GPU:
- **CPU time:** ~15ms per frame (Macbook Air M3)
- **Bottleneck:** CPU vertex generation + GPU upload bandwidth

## Static geometry approach
Because most things don't change per frame and the cpu frame-time was already around 15ms , I switched to a static approach:
Build geometry once on the CPU, upload to the GPU (using `STATIC_DRAW` in `glDrawArrays()`), then redraw this uploaded buffer each frame using the current camera position and zoom. Results:
- **CPU time:** ~0.5ms per frame (only camera matrix update)
- **Initial upload:** ~12ms one-time cost
- **GPU time:** No measurable change (geometry complexity is same)

## Tradeoffs
**Advantages**
- Minimal per-frame CPU overhead
- Maximizes batching (single draw call for 50k rectangles)
- GPU does all transform work

**Limitations:**
- Geometry cannot change without rebuilding entire buffer
- Higher initial load time (~12ms for 50k rectangles)
- Not suited for dynamic/animated content

# Hatching: Diagonal Lines
Created in the fragment shader (`public/shaders/default.fs`).
- We create a 45 degree diagonal pattern by doing `uv.x + uv.y` (before, we convert to worldspace)
- We multiply by Zoom to stay zoom invariant
- We space out the lines / repeat the pattern, by doing a `mod()` on the result
- Because we only want to draw lines (and not the background), we use `step()` to extract the first `lineWidthInPx` pixels

# Running Locally
Run in your terminal:
```
yarn
yarn dev
```
Open in browser:
`http://localhost:5173/`
