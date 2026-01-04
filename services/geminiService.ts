
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
    你是一位「品牌創意教練」。你的目標不是單純指出錯誤，而是幫助創意人員在「品牌 CI 框架」內發揮最大的「創意自由」。
    
    你的審核邏輯：
    1. 品牌守護：確保顏色、標誌與核心調性不偏離。
    2. 創意鼓勵：如果素材有驚艷的視覺效果或大膽的構圖，即使略微偏離傳統規範，只要「靈魂」契合品牌，也應給予正面肯定。
    3. 實戰建議：提供具體的調整方法，而不是模糊的批評。
    
    請輸出的 JSON 物件內容完全使用繁體中文。
  `;

  const prompt = `
    【品牌規範】
    - 名稱：${ci.name}
    - 受眾：${ci.targetAudience}
    - 關鍵調性：${ci.tone}
    - 品牌人格：${ci.persona}
    - CI 細節：${ci.additionalRules}

    【創作情境】
    - 活動背景：${campaignContext || '一般品牌推廣'}
    - 創作目的：${intent || '未提供'}

    請以「創意教練」的身份分析附件圖片。
    請特別給予「創意能量 (creativeEnergy)」評分，衡量視覺的驚艷度。
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
