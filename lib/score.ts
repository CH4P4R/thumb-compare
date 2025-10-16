import sharp from "sharp";

export interface ThumbnailScore {
  avgBrightness: number;
  contrast: number;
  textRatio: number;
  faceDetected: boolean;
  score: number;
}

/**
 * Analyzes a thumbnail image and returns various metrics
 */
export async function analyzeThumbnail(imagePath: string): Promise<ThumbnailScore> {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Calculate average brightness (luminance)
    const avgBrightness = calculateAvgBrightness(stats);

    // Calculate contrast (RMS contrast)
    const contrast = calculateContrast(stats);

    // Text ratio - placeholder for now (would need OCR)
    // In MVP, we can use edge detection as a proxy for text
    const textRatio = 0; // TODO: Implement with Tesseract.js if needed

    // Face detection - placeholder (would need OpenCV or similar)
    const faceDetected = false; // TODO: Implement face detection if needed

    // Calculate final score (0-100)
    const score = calculateFinalScore({
      avgBrightness,
      contrast,
      textRatio,
      faceDetected,
    });

    return {
      avgBrightness: Math.round(avgBrightness * 100) / 100,
      contrast: Math.round(contrast * 100) / 100,
      textRatio: Math.round(textRatio * 100) / 100,
      faceDetected,
      score: Math.round(score * 100) / 100,
    };
  } catch (error) {
    console.error("Error analyzing thumbnail:", error);
    throw error;
  }
}

function calculateAvgBrightness(stats: sharp.Stats): number {
  // Calculate luminance from RGB channels
  // Formula: 0.299*R + 0.587*G + 0.114*B
  const channels = stats.channels;
  if (channels.length < 3) return 0;

  const r = channels[0].mean / 255;
  const g = channels[1].mean / 255;
  const b = channels[2].mean / 255;

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function calculateContrast(stats: sharp.Stats): number {
  // RMS (Root Mean Square) contrast
  // Using the standard deviation as a proxy
  const channels = stats.channels;
  if (channels.length === 0) return 0;

  // Average std dev across all channels
  const avgStdDev =
    channels.reduce((sum, channel) => sum + channel.stdev, 0) / channels.length;

  // Normalize to 0-1 range (assuming max std dev of 128)
  return Math.min(avgStdDev / 128, 1);
}

function calculateFinalScore(metrics: {
  avgBrightness: number;
  contrast: number;
  textRatio: number;
  faceDetected: boolean;
}): number {
  // Scoring formula from the spec:
  // score = 0.35*contrast + 0.2*brightness_score + 0.25*(1 - text_density_norm) + 0.2*face_bonus

  // Brightness score: penalize extremes, reward middle values
  const brightnessScore = 1 - Math.abs(metrics.avgBrightness - 0.5) * 2;

  // Contrast score: higher is generally better
  const contrastScore = metrics.contrast;

  // Text density: lower is better (inverse)
  const textDensityScore = 1 - metrics.textRatio;

  // Face bonus: binary
  const faceBonus = metrics.faceDetected ? 1 : 0.5;

  const score =
    0.35 * contrastScore + 0.2 * brightnessScore + 0.25 * textDensityScore + 0.2 * faceBonus;

  // Convert to 0-100 scale
  return score * 100;
}

/**
 * Process and optimize a thumbnail for storage
 */
export async function processThumbnail(
  inputBuffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Buffer> {
  const { width = 1280, height = 720, quality = 90 } = options;

  return sharp(inputBuffer)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality })
    .toBuffer();
}

