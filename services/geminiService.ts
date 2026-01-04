
import { GoogleGenAI, Type } from "@google/genai";
import { BrandCI, AuditResult } from "../types";

export const auditAsset = async (
  imageData: string,
  ci: BrandCI,
  intent: string,
  campaignContext: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<AuditResult> => {
  // 關鍵：必須在函數內部獲取 API_KEY，因為連結器 (openSelectKey) 會動態更新它
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("請先點擊頁面右上角的「連結 Google AI」按鈕以授權服務。");
  }

  // 根據 Google 規範，每次調用前創建新實例以確保金鑰最新
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    你是一位「品牌視覺與社群趨勢專家」。
    你的任務是審核廣告素材。請平衡品牌一致性與社群吸引力。
    請輸出的 JSON 物件內容完全使用繁體中文。
  `;

  const prompt = `
    【品牌核心規範】
    - 名稱：${ci.name}
    - 核心受眾：${ci.targetAudience}
    - 色彩：主色(${ci.primaryColor}), 輔助色(${ci.secondaryColor})
    - 品牌人格：${ci.persona}
    - 額外規則：${ci.additionalRules}

    【創作情境】
    - 活動背景：${campaignContext || '一般品牌推廣'}
    - 創作目的：${intent || '未提供'}

    請分析附件圖片的「品牌合規性」與「行銷潛力」。
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
            suggestions: {
              type: Type.OBJECT,
              properties: {
                compliance: { type: Type.ARRAY, items: { type: Type.STRING } },
                creative: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["compliance", "creative"]
            }
          },
          required: ["overallScore", "healthStatus", "metrics", "suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 回傳內容為空");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    
    // 專門處理 429 (免費版限流)
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("【免費版配額已滿】請等候 30 秒再試，或更換金鑰。");
    }
    
    // 專門處理金鑰失效
    if (error.message?.includes("not found") || error.message?.includes("API_KEY_INVALID")) {
      throw new Error("金鑰已失效，請點擊「切換 AI 帳戶」重新連結。");
    }

    throw new Error(`分析出錯：${error.message}`);
  }
};
