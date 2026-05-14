const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");

const readNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const readBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    return ["1", "true", "yes", "on"].includes(
        String(value).trim().toLowerCase(),
    );
};

const resolveFromRoot = (value, fallback) => {
    const normalizedValue = value || fallback;

    return path.isAbsolute(normalizedValue)
        ? normalizedValue
        : path.join(projectRoot, normalizedValue);
};

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const systemPrompt = `Bạn là chatbot tư vấn cho website bán kính.
Nhiệm vụ của bạn là hỗ trợ khách hàng về gọng kính, kính râm, tròng kính, giá sản phẩm, tồn kho và chính sách cửa hàng.

Chỉ trả lời dựa trên CONTEXT được cung cấp.
Không tự bịa hoặc suy đoán giá, tồn kho, thương hiệu, chất liệu, màu sắc, bảo hành, đổi trả, giao hàng, thanh toán, địa chỉ hoặc khuyến mãi.
Nếu CONTEXT không đủ thông tin, trả lời đúng câu: "Hiện tôi chưa có đủ thông tin trong hệ thống."
Không nhắc đến CONTEXT, chunk, metadata, JSON hoặc dữ liệu nội bộ trong câu trả lời.

Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dễ hiểu như một tư vấn viên bán hàng.
Nếu hỏi về sản phẩm, hãy nêu các thông tin có trong CONTEXT như tên, loại, thương hiệu, chất liệu, màu sắc, giá và tồn kho.
Nếu hỏi về chính sách, hãy trả lời đúng quy định trong CONTEXT, không thêm điều kiện ngoài dữ liệu.
Nếu có nhiều sản phẩm phù hợp, liệt kê tối đa 3 đến 5 sản phẩm.
Nếu câu hỏi chưa rõ, hãy hỏi lại một câu ngắn để làm rõ nhu cầu.`;

module.exports = {
    projectRoot,
    systemPrompt,
    rag: {
        chunksPath: resolveFromRoot(
            process.env.RAG_CHUNKS_PATH,
            "data/rag/rag_chunks.jsonl",
        ),
        indexPath: resolveFromRoot(
            process.env.RAG_INDEX_PATH,
            "data/rag/vector_index.json",
        ),
        testQuestionsPath: resolveFromRoot(
            process.env.RAG_TEST_QUESTIONS_PATH,
            "data/rag/test_question.jsonl",
        ),
        topK: Math.max(1, readNumber(process.env.RAG_TOP_K, 5)),
        minScore: readNumber(process.env.RAG_MIN_SCORE, 0.3),
    },
    embedding: {
        apiUrl: process.env.EMBEDDING_API_URL || "http://localhost:8001/embed",
        timeoutMs: readNumber(process.env.EMBEDDING_TIMEOUT_MS, 30000),
    },
    rerank: {
        apiUrl: process.env.RERANK_API_URL || "http://localhost:8002/rerank",
        useRerank: readBoolean(process.env.USE_RERANK, false),
        timeoutMs: readNumber(process.env.RERANK_TIMEOUT_MS, 30000),
    },
    deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || "",
        baseUrl: trimTrailingSlash(
            process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
        ),
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        timeoutMs: readNumber(process.env.DEEPSEEK_TIMEOUT_MS, 60000),
    },
};
