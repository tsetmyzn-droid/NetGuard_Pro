import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is required for auto-fix script");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function analyzeLogs(logPath) {
  try {
    const logs = fs.readFileSync(logPath, 'utf8');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these build logs and provide a concise explanation of the error and a suggested fix in code format. If multiple errors exist, focus on the first blocker: \n\n${logs.slice(-5000)}`,
    });

    console.log("--- AI LOG ANALYSIS ---");
    console.log(response.text);
    console.log("-----------------------");
  } catch (error) {
    console.error("Error analyzing logs:", error);
  }
}

const logFile = process.argv[2];
if (logFile) {
  analyzeLogs(logFile);
} else {
  console.log("Please provide a log file path.");
}
