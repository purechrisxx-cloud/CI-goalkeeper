
import { GoogleGenAI, Type } from "@google/genai";
import { BrandCI, AuditResult } from "../types";

export const auditAsset = async (
  imageData: string,
  ci: BrandCI,
  intent: string,
  campaignContext: string = '團隊內部創意審核',
  modelName: string = 'gemini-3-flash-preview'
): Promise<AuditResult> => {
  // CRITICAL: 根據規範，必須在每次請求前建立新實例，以確保使用最新的 process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  // 這裡不直接報錯 API Key 缺失，因為我們讓 UI 去處理連線邏輯
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const systemInstruction = `
    你是一位專業的「品牌創意教練」。任務是協助產出符合 ${ci.name} 品牌規範且具市場共鳴的素材。
    品牌人格：${ci.persona}
    語調風格：${ci.tone}
    受眾：${ci.targetAudience}
    
    請深度分析素材的顏色、排版、Logo 擺放以及整體構圖。
    評分標準 0-100。
    請以繁體中文輸出 JSON 格式。
  `;

  const prompt = `
    請分析這張素材。
    素材目的：${intent || '品牌形象傳達'}
    品牌背景：${ci.brandStory}
    視覺指南：${ci.styleGuidelines}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] } }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            creativeEnergy: { type: Type.NUMBER },
            visualImpact: { type: Type.NUMBER },
            healthStatus: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                colors: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
                typography: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
                logo: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
                composition: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } }
              },
              required: ["colors", "typography", "logo", "composition"]
            },
            marketingCritique: { type: Type.STRING },
            creativeCritique: { type: Type.STRING },
            suggestions: {
              type: Type.OBJECT,
              properties: {
                compliance: { type: Type.ARRAY, items: { type: Type.STRING } },
                creative: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["compliance", "creative"]
            }
          },
          required: ["overallScore", "creativeEnergy", "visualImpact", "healthStatus", "metrics", "suggestions", "creativeCritique"]
        }
      }
    });

    const result = response.text;
    if (!result) throw new Error("AI 回傳內容為空");
    return JSON.parse(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // 捕獲特定金鑰錯誤
    if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
      throw new Error("AI 授權無效。請點擊上方按鈕重新選取有效的 API 金鑰。");
    }
    throw error;
  }
};
