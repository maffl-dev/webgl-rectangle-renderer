in vec2 position;
in vec4 color;
in vec2 uv;
in vec2 size;
in float strokeWidth;

uniform mat3 Transform;
uniform float Zoom;
uniform vec2 Resolution;

out vec4 Color;
out vec2 UV;
out vec2 Size;
out float StrokeWidth;

void main() {
	vec3 transformed = Transform * vec3(position, 1.0);

	// Convert from pixels to clipspace
    vec2 zeroToOne = transformed.xy / Resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // Flip Y to make origin top-left
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    Color = color;
    UV = uv;
	Size = size;
	StrokeWidth = strokeWidth;
}