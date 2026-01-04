
import { GoogleGenAI, Type } from "@google/genai";
import { BrandCI, AuditResult } from "../types";

export const auditAsset = async (
  imageData: string,
  ci: BrandCI,
  intent: string,
  campaignContext: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<AuditResult> => {
  // 直接使用環境變數中的 API Key，這是系統自動注入的
  const apiKey = process.env.API_KEY;
  
  // 根據 Google GenAI SDK 規範：必須在每次請求前使用 new 實例化，以確保使用最新的 Key 狀態
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const systemInstruction = `
    你是一位「品牌創意教練」。你的任務是協助團隊產出符合 ${ci.name} 品牌規範且具備市場共鳴的素材。
    
    審核原則：
    1. 靈魂共鳴：素材是否傳達了品牌故事 (${ci.brandStory})。
    2. 規範一致：檢查視覺風格 (${ci.styleGuidelines})、顏色 (${ci.primaryColor}, ${ci.secondaryColor})。
    3. 目的達成：評估素材是否能觸動受眾 (${ci.targetAudience}) 並達成目的 (${intent})。
    4. 迭代建議：給予 3 個具體的優化方向。
    
    請以繁體中文輸出 JSON 格式。
  `;

  const prompt = `
    請分析這張素材。
    品牌人格：${ci.persona}
    目前的素材目的：${intent || '品牌形象建立'}
    目標受眾：${ci.targetAudience}
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
    if (!result) throw new Error("AI 無法解析素材內容。");
    return JSON.parse(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // 重新封裝錯誤訊息，避免讓使用者看到混亂的 API 報錯
    if (error.message?.includes("API key")) {
      throw new Error("AI 連線失敗：環境變數中的 API Key 無效或尚未生效。請確認 Vercel 環境設定。");
    }
    throw new Error(`分析失敗：${error.message}`);
  }
};
