
import { GoogleGenAI, Type } from "@google/genai";
import { BrandCI, AuditResult } from "../types";

export const auditAsset = async (
  imageData: string,
  ci: BrandCI,
  intent: string,
  campaignContext: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<AuditResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("請先點擊頁面右上角的「連結 Google AI」按鈕以授權服務。");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    你是一位「品牌創意教練與策略師」。你的目標是幫助團隊產出既符合品牌核心靈魂，又能達成商業目的的素材。
    
    你的審核邏輯：
    1. 靈魂契合：基於品牌故事 (${ci.brandStory}) 與使命 (${ci.mission})，審核素材是否傳遞了正確的價值觀。
    2. 視覺一致：嚴格審核顏色 (${ci.primaryColor}, ${ci.secondaryColor}) 與風格指南 (${ci.styleGuidelines})。
    3. 目的達成：評估素材是否能觸及目標受眾 (${ci.targetAudience}) 並達成其特定目的 (${intent})。
    4. 創意能量：衡量視覺的驚艷程度與大膽程度。
    
    請輸出的 JSON 物件內容完全使用繁體中文。
  `;

  const prompt = `
    【品牌核心】
    - 名稱：${ci.name}
    - 故事背景：${ci.brandStory}
    - 品牌識別：${ci.mission}
    - 風格指南：${ci.styleGuidelines}
    - 品牌人格：${ci.persona}
    - 主/副色：${ci.primaryColor} / ${ci.secondaryColor}

    【此次審核情境】
    - 目標受眾：${ci.targetAudience}
    - 素材目的：${intent || '品牌形象建立'}
    - 活動脈絡：${campaignContext}

    請針對以上資訊與附件圖片進行深度審核。
    你需要提供具體的「教練式建議」，在指出不合規處的同時，也建議如何讓創意更具吸引力。
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

    const text = response.text;
    if (!text) throw new Error("AI 回傳內容為空");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`分析出錯：${error.message}`);
  }
};
