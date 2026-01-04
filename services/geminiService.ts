import { GoogleGenAI, Type } from "@google/genai";
import { BrandCI, AuditResult } from "../types";

export const auditAsset = async (
  imageData: string,
  ci: BrandCI,
  intent: string,
  campaignContext: string
): Promise<AuditResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    你是一位全球領先的「數位行銷總監」兼「品牌視覺守護者」。
    你的任務是審核廣告素材，必須平衡「品牌一致性 (CI)」與「社群吸引力 (Hook)」。
    
    分析架構：
    1. 品牌合規 (CI Compliance)：顏色、字體、Logo、品牌語氣。
    2. 社群吸引力 (Viral Hook)：是否符合當前社群審美？
    3. 受眾契合度 (Audience Fit)：素材是否能引起目標受眾共鳴？
    4. 時事結合 (Trend Relevance)：素材如何借力使力？

    請輸出的 JSON 物件內容完全使用繁體中文。
  `;

  const prompt = `
    【品牌核心規範】
    - 名稱：${ci.name}
    - 核心受眾：${ci.targetAudience}
    - 色彩：主色(${ci.primaryColor}), 輔助色(${ci.secondaryColor})
    - 品牌人格：${ci.persona}
    - CTA 策略：${ci.ctaStrategy}
    - 其他規範：${ci.additionalRules}

    【當前創作情境】
    - 創作意圖：${intent || '未提供'}
    - 活動背景：${campaignContext || '一般品牌推廣'}

    請審核附件圖片。請針對「社群行銷吸引力」給予深入的分析。
  `;

  const response = await ai.models.generateContent({
    model,
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
              colors: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, feedback: { type: Type.STRING } } },
              typography: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, feedback: { type: Type.STRING } } },
              logo: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, feedback: { type: Type.STRING } } },
              composition: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, feedback: { type: Type.STRING } } }
            }
          },
          marketingCritique: { type: Type.STRING },
          creativeCritique: { type: Type.STRING },
          suggestions: {
            type: Type.OBJECT,
            properties: {
              compliance: { type: Type.ARRAY, items: { type: Type.STRING } },
              creative: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          freedomAssessment: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};