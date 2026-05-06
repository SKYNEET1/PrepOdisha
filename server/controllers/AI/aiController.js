const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

exports.askAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const completion = await client.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful educational assistant for StudyNotion.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const reply = completion.choices[0].message.content;

        return res.status(200).json({
            success: true,
            data: reply,
        });

    } catch (error) {
        console.error("OPENROUTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate AI response",
            error: error.message,
        });
    }
};