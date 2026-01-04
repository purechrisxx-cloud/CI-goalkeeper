
import { GoogleGenAI, Type } from "@google/genai";
import { BrandCI, AuditResult } from "../types";

export const auditAsset = async (
  imageData: string,
  ci: BrandCI,
  intent: string,
  campaignContext: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<AuditResult> => {
  // 每次調用時重新獲取最新的 API_KEY，確保連結後立即生效
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("尚未連結 Google AI。請點擊頁面右上角的「連結 Google AI」按鈕。");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    你是一位「品牌視覺與社群趨勢專家」。你的任務是審核廣告素材。
    你的分析必須嚴謹且具備洞察力，平衡品牌 CI 規範與社群吸睛度。
    請輸出的 JSON 物件內容完全使用繁體中文。
  `;

  const prompt = `
    【品牌核心規範】
    - 名稱：${ci.name}
    - 核心受眾：${ci.targetAudience}
    - 色彩：主色(${ci.primaryColor}), 輔助色(${ci.secondaryColor})
    - 品牌人格：${ci.persona}
    - 規則：${ci.additionalRules}

    【當前創作情境】
    - 活動背景：${campaignContext || '一般品牌推廣'}
    - 創作目的：${intent || '未提供'}

    請審核附件圖片。請針對「品牌合規度」與「社群轉換潛力」進行分析。
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
            audienceResonance: { type: Type.NUMBER },
            trendRelevance: { type: Type.NUMBER },
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

    const resultText = response.text;
    if (!resultText) throw new Error("AI 無法理解這張圖片，請嘗試更換圖片或重新上傳。");
    return JSON.parse(resultText);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // 針對免費版常見錯誤的處理
    if (error.message?.includes("429") || error.message?.toLowerCase().includes("exhausted")) {
      throw new Error("【免費版配額已滿】您目前使用的 Gemini 免費版金鑰已達每分鐘限制，請稍候 30-60 秒再試，或更換為付費金鑰。");
    }
    if (error.message?.includes("entity was not found") || error.message?.includes("API_KEY_INVALID")) {
      throw new Error("金鑰無效。請重新點擊「連結 Google AI」選擇一個正確的 API 專案。");
    }
    
    throw new Error(`分析失敗：${error.message || '未知錯誤'}`);
  }
};
