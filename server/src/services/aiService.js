import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const callGroqAPI = async (messages, responseFormat = null) => {
    try {
        const payload = {
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false
        };

        if (responseFormat === "json_object") {
            payload.response_format = { type: "json_object" };
        }

        const response = await axios.post(GROQ_API_URL, payload, {
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Error:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const generateInsights = async (spendingData) => {
    try {
        const systemPrompt = `
      Analyze the provided spending data and return a JSON object with a key "insights" containing an array of 3 strings.
      Analyze transaction patterns and generate personalized savings recommendations suitable for Llama 3 analysis.
      Each string should be a concise, actionable saving tip or insight based on their actual spending habits.
      Example Output: { "insights": ["Consider cooking on weekends to save on dining out.", "You can save ~10% by booking travel in advance.", "Review unused subscriptions to cut monthly costs."] }
    `;

        const userPrompt = `Data: ${JSON.stringify(spendingData)}`;

        const text = await callGroqAPI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], "json_object");

        console.log("Groq Insights Raw:", text);
        const json = JSON.parse(text);
        return json.insights || ["Unable to parse insights."];

    } catch (error) {
        console.error("AI Insight Error:", error);
        return ["Unable to generate insights at this time."];
    }
};

export const generateBudgetAdvice = async (budget, totalSpent, categoryBreakdown, currency = "INR") => {
    try {
        const systemPrompt = `
      You are a financial advisor.
      Analyze the budget status and provide a JSON object with:
      1. "analysis": A short string (2 sentences).
      2. "tips": An array of 2 strings (specific tips).
      
      IMPORTANT: Always use the '${currency}' symbol or code when mentioning money values. Do NOT use '$' unless the currency is USD.
      Example Output: { "analysis": "...", "tips": ["...", "..."] }
    `;

        const userPrompt = `
      Monthly Budget: ${budget}
      Total Spent So Far: ${totalSpent}
      Category Breakdown: ${JSON.stringify(categoryBreakdown)}
      Currency: ${currency}
    `;

        const text = await callGroqAPI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], "json_object");

        console.log("Groq Budget Raw:", text);
        return JSON.parse(text);

    } catch (error) {
        console.error("AI Budget Error:", error);
        return {
            analysis: "Unable to analyze budget.",
            tips: ["Track your expenses carefully."]
        };
    }
};

export const chatWithUser = async (message, contextData) => {
    try {
        const systemPrompt = `
      You are Limitly AI, a helpful and friendly financial assistant.
      Use the provided financial context to answer user questions.
      Return a JSON object with a single key "response".
      Example Output: { "response": "Your helpful message here." }
    `;

        const userPrompt = `
      Context (Expenses): ${JSON.stringify(contextData)}
      User Message: "${message}"
    `;

        const text = await callGroqAPI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], "json_object");

        console.log("Groq Chat Raw:", text);
        return JSON.parse(text);

    } catch (error) {
        console.error("AI Chat Error:", error);
        return { response: "I'm having trouble thinking right now. Please try again." };
    }
};
