import { GoogleGenAI } from "@google/genai";
import { ScanResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeSecurityReport = async (results: ScanResult[]): Promise<string> => {
  if (!apiKey) return "API Key not configured. Unable to perform AI analysis.";

  const failed = results.filter(r => r.status === 'failed');
  const success = results.filter(r => r.status === 'success');

  const prompt = `
    You are a cybersecurity expert analyzing FTP/SFTP connection logs.
    
    Summary:
    - Total Attempts: ${results.length}
    - Successful: ${success.length}
    - Failed: ${failed.length}

    Failed Connection Samples:
    ${failed.slice(0, 5).map(f => `- ${f.serverConfig.host} (${f.serverConfig.username}): ${f.message}`).join('\n')}

    Successful Connection Samples:
    ${success.slice(0, 5).map(s => `- ${s.serverConfig.host} (${s.serverConfig.username}): ${s.connectionTimeMs}ms`).join('\n')}

    Please provide a concise security assessment. 
    1. Identify potential misconfigurations (e.g., weak credentials found).
    2. Explain common reasons for the failures observed.
    3. Recommend best practices for securing these FTP/SFTP endpoints.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Failed to contact AI service for analysis.";
  }
};

export const explainError = async (errorMsg: string): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain this FTP/SFTP error message simply and suggest a fix: "${errorMsg}"`,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    return "Error analyzing message.";
  }
};
