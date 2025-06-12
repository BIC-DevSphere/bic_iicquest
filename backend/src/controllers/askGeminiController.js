import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export const askGemini = async (req, res) => {
    try {
        const { title, body, postId } = req.body;

        if (!title || !body || !postId)
            return res.status(400).json({ message: "PostId, title and body are required" });

        const foundPost = await Post.findById(postId);
        if (!foundPost) return res.status(404).json({ message: "Post not found" });

        const prompt = `${title}\n${body}\nGive me a brief answer in maximum 150 words.`;

        // const result = await model.generateContent(prompt);
        // const response = result.response.text();

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
        });
        console.log(response.text);

        res.status(200).json({ result: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
