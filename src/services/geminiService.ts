import { GoogleGenAI, Type } from "@google/genai";

export interface ProductHealth {
  status: "healthy" | "warning" | "critical";
  reason: string;
  recommendation: string;
}

export async function analyzeProductHealth(
  productName: string,
  price: number,
  cost: number,
  margin: number,
  markup: number
): Promise<ProductHealth> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      status: "warning",
      reason: "API Key do Gemini ausente.",
      recommendation: "Adicione GEMINI_API_KEY no arquivo .env ou Vercel para ativar a IA.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise a saúde financeira deste produto de e-commerce:
    Nome: ${productName}
    Preço de Venda: R$ ${price}
    Custo: R$ ${cost}
    Margem: ${margin.toFixed(2)}%
    Markup: ${markup.toFixed(2)}x

    Considere que uma margem saudável para varejo de vidros/casa costuma ser acima de 30%.
    Retorne um JSON com: status (healthy, warning, critical), reason (breve explicação) e recommendation (o que fazer).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["healthy", "warning", "critical"] },
          reason: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["status", "reason", "recommendation"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      status: "warning",
      reason: "Erro ao analisar dados.",
      recommendation: "Verifique manualmente as margens.",
    };
  }
}
