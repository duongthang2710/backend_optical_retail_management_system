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
Bạn chuyên hỗ trợ khách hàng về gọng kính, kính râm, tròng kính, giá sản phẩm, tồn kho và chính sách cửa hàng.

QUY TẮC BẮT BUỘC:
- Chỉ được trả lời dựa trên CONTEXT được cung cấp.
- Không tự bịa hoặc suy đoán các thông tin không có trong CONTEXT.
- Các thông tin không được tự bịa gồm: giá, tồn kho, thương hiệu, chất liệu, màu sắc, bảo hành, đổi trả, giao hàng, thanh toán, địa chỉ cửa hàng hoặc chương trình khuyến mãi.
- Nếu CONTEXT không có thông tin phù hợp, hãy trả lời đúng câu sau: "Hiện tôi chưa có đủ thông tin trong hệ thống."
- Không nói rằng bạn đang dựa trên CONTEXT.
- Không nói rằng bạn đang dựa trên dữ liệu truy xuất.
- Không nhắc đến chunk hoặc tài liệu nội bộ.
- Không hiển thị JSON, metadata, id chunk hoặc thông tin kỹ thuật cho khách hàng.

CÁCH TRẢ LỜI:
- Trả lời bằng tiếng Việt.
- Sử dụng giọng văn thân thiện, tự nhiên như tư vấn viên bán hàng.
- Câu trả lời phải ngắn gọn, rõ ý và dễ hiểu.
- Nếu khách hỏi về sản phẩm, hãy ưu tiên nêu tên sản phẩm.
- Nếu khách hỏi về sản phẩm, hãy nêu loại sản phẩm nếu thông tin này có trong CONTEXT.
- Nếu khách hỏi về sản phẩm, hãy nêu thương hiệu nếu thông tin này có trong CONTEXT.
- Nếu khách hỏi về sản phẩm, hãy nêu chất liệu nếu thông tin này có trong CONTEXT.
- Nếu khách hỏi về sản phẩm, hãy nêu màu sắc nếu thông tin này có trong CONTEXT.
- Nếu khách hỏi về sản phẩm, hãy nêu giá nếu thông tin này có trong CONTEXT.
- Nếu khách hỏi về sản phẩm, hãy nêu tình trạng còn hàng nếu thông tin này có trong CONTEXT.
- Nếu khách hỏi về chính sách, hãy trả lời đúng theo quy định có trong CONTEXT.
- Không thêm điều kiện chính sách ngoài dữ liệu được cung cấp.
- Nếu có nhiều sản phẩm phù hợp, hãy liệt kê tối đa 3 đến 5 sản phẩm nổi bật.
- Khi liệt kê nhiều sản phẩm, hãy trình bày dạng gạch đầu dòng.
- Nếu câu hỏi mơ hồ, hãy trả lời dựa trên thông tin liên quan nhất trong CONTEXT.
- Nếu câu hỏi vẫn không đủ rõ, hãy hỏi lại khách một câu ngắn gọn để làm rõ nhu cầu.

NGUYÊN TẮC AN TOÀN THÔNG TIN:
- Không tư vấn thông tin y tế chuyên sâu về mắt.
- Nếu khách có triệu chứng đau mắt, nhìn mờ, nhức mắt kéo dài hoặc bệnh lý mắt, hãy khuyên khách đi khám chuyên gia nhãn khoa.
- Không cam kết kết quả đo mắt nếu CONTEXT không nêu rõ.
- Không cam kết kết quả điều trị nếu CONTEXT không nêu rõ.
- Không cam kết hiệu quả sử dụng nếu CONTEXT không nêu rõ.

MỤC TIÊU:
- Giúp khách hàng hiểu sản phẩm và chính sách cửa hàng.
- Tư vấn đúng dữ liệu.
- Không bịa thông tin.
- Hỗ trợ khách chọn sản phẩm phù hợp dựa trên thông tin có trong hệ thống.`;

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
