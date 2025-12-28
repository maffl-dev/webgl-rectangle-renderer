in vec4 Color;
in vec2 UV;
in vec2 Size;
in float StrokeWidth;

uniform sampler2D Texture;
uniform float Zoom;

out vec4 FragColor;

bool isInStrokeRegion(vec2 pixelPos, float strokeWidth) {
	vec2 distToEdge = min(pixelPos, Size - pixelPos);
    float minDist = min(distToEdge.x, distToEdge.y);
    return minDist < strokeWidth;
}

float diagonalStripes(vec2 uv, float spacingInScreenPx, float lineWidthInPx) {
    vec2 worldPos = uv * Size;
	if (isInStrokeRegion(worldPos, StrokeWidth/Zoom)) {
		return 0.0;
	}
	float diagonalDistScreen = (worldPos.x + worldPos.y) * Zoom;
    float patternPosition = mod(diagonalDistScreen, spacingInScreenPx);
    return step(patternPosition, lineWidthInPx);
}

void main() {
	vec4 texColor = texture(Texture, UV);
	
	// if Size is zero, skip stroke logic
    if (Size.x == 0.0 || Size.y == 0.0 || StrokeWidth == 0.0) {
        FragColor = texColor * Color;
        return;
    }

	// stroke
	vec2 worldPos = UV * Size;
    float strokeWorldWidth = StrokeWidth / Zoom; // Stroke thickness invariance
    bool isStroke = isInStrokeRegion(worldPos, strokeWorldWidth);
	vec4 result = texColor * Color;
    if (isStroke) {
        result *= 1.5;
    }

	// hatch pattern: diagonal stripes
	float stripeHatch = diagonalStripes(UV, 10.0, 2.0);
	result += stripeHatch * 0.15;

	// output
	FragColor = clamp(result, 0.0, 1.0);;
}

/*
// First explicit rect check version
bool isInStrokeRegion_ExplicitRectCheck(vec2 p, vec4 rect, float borderWidth) {
	vec2 min = vec2(rect.xy);
	vec2 max = vec2(rect.zw);

	bool inFullRect = (p.x >= min.x && p.y >= min.y) && (p.y >= min.y && p.y <= max.y);
	if (!inFullRect) return false;

	bool inInnerRect = (p.x > min.x + borderWidth &&
		p.y > min.y + borderWidth &&
		p.x < max.x - borderWidth &&
		p.y < max.y - borderWidth);
	
	return !inInnerRect;
}
*/