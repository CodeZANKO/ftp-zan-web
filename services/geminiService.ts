import { GoogleGenAI } from "@google/genai";
import { ScanResult, LogEntry } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeSecurityReport = async (results: ScanResult[]): Promise<string> => {
  if (!apiKey) return "API Key not configured. Unable to perform AI analysis.";

  const failed = results.filter(r => r.status === 'failed');
  const success = results.filter(r => r.status === 'success');
  const bannerList = Array.from(new Set(results.map(r => r.banner).filter(Boolean)));
  const countries = Array.from(new Set(results.map(r => r.geo?.country).filter(Boolean)));

  const prompt = `
    You are a cybersecurity expert analyzing FTP/SFTP connection logs for a Security Operations Center (SOC).
    
    Data Summary:
    - Total Attempts: ${results.length}
    - Successful: ${success.length}
    - Failed: ${failed.length}
    - Detected Server Types (Banners): ${bannerList.join(', ') || 'None detected'}
    - Geographic spread: ${countries.join(', ')}

    Failed Connection Samples:
    ${failed.slice(0, 5).map(f => `- ${f.serverConfig.host} (${f.serverConfig.username}): ${f.message}`).join('\n')}

    Please provide a professional executive summary in Markdown format.
    1. **Threat Assessment**: Are there signs of brute force or weak credentials?
    2. **Infrastructure Health**: Comment on the diversity of server versions and latency.
    3. **Recommendations**: 3 bullet points for hardening.
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

export const chatWithSecurityData = async (
  query: string, 
  contextData: { results: ScanResult[], logs: LogEntry[] }
): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  const systemInstruction = `
    You are an AI Security Assistant embedded in an FTP/SFTP Manager tool.
    You have access to the current session's scan results and logs.
    Answer the user's questions about the data concisely and professionally.
    
    Current Data Context:
    - Total Scans: ${contextData.results.length}
    - Success Rate: ${Math.round((contextData.results.filter(r => r.status === 'success').length / contextData.results.length) * 100)}%
    - Unique Hosts: ${new Set(contextData.results.map(r => r.serverConfig.host)).size}
    - Errors: ${contextData.results.filter(r => r.status === 'failed').map(r => r.message).join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I couldn't process that request.";
  } catch (error) {
    return "Error communicating with AI service.";
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