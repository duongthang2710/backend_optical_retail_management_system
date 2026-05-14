const chatbotService = require("../services/chatbotService");

class ChatbotController {
    async chat(req, res) {
        try {
            const { message } = req.body || {};

            if (typeof message !== "string" || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "message is required",
                });
            }

            const result = await chatbotService.chat(message);

            return res.status(200).json({
                success: true,
                answer: result.answer,
                sources: result.sources,
            });
        } catch (error) {
            console.error(`[chatbot] ${error.message}`);

            const statusCode =
                Number(error.statusCode || error.status) >= 400 &&
                Number(error.statusCode || error.status) < 600
                    ? Number(error.statusCode || error.status)
                    : 500;

            return res.status(statusCode).json({
                success: false,
                message: error.message || "Chatbot error",
            });
        }
    }
}

module.exports = new ChatbotController();
