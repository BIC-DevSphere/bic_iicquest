import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askGemini = async (req, res) => {
  try {
    const { title, body, postId } = req.body;

    if (!title || !body || !postId)
      return res.status(400).json({ message: "PostId, title and body are required" });

    const prompt = `${title}\n${body}\nGive me a brief answer in maximum 150 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
