import OpenAI from "openai";

// OpenAI Vision API ile thumbnail analizi
export async function analyzeWithAI(imageUrl: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("OpenAI API key not found, skipping AI analysis");
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this YouTube thumbnail and provide a detailed analysis in JSON format:
              {
                "clickworthiness": 0-100 score,
                "faceDetected": boolean,
                "emotionDetected": string or null,
                "textReadability": 0-100 score,
                "visualAppeal": 0-100 score,
                "colorScheme": string description,
                "suggestions": [array of 3-5 improvement suggestions],
                "strengths": [array of 2-3 strengths],
                "weaknesses": [array of 2-3 weaknesses]
              }
              Be specific and actionable in your analysis.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (error) {
    console.error("AI analysis error:", error);
    return null;
  }
}

// Replicate alternatifi (ücretsiz/ucuz)
export async function analyzeWithReplicate(imageUrl: string) {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    console.warn("Replicate API key not found");
    return null;
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "llava-13b-model-version-here",
        input: {
          image: imageUrl,
          prompt: "Analyze this YouTube thumbnail. Rate its clickworthiness from 0-100 and explain why.",
        },
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Replicate analysis error:", error);
    return null;
  }
}

// Batch analiz (multiple thumbnails)
export async function batchAnalyze(imageUrls: string[]) {
  const results = await Promise.allSettled(
    imageUrls.map(url => analyzeWithAI(url))
  );

  return results.map((result, index) => ({
    url: imageUrls[index],
    analysis: result.status === "fulfilled" ? result.value : null,
    error: result.status === "rejected" ? result.reason : null,
  }));
}

