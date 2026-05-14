require("dotenv").config({ quiet: true });

const fs = require("fs/promises");

const chatbotConfig = require("../src/config/chatbotConfig");
const chatbotService = require("../src/services/chatbotService");

const readTestQuestions = async () => {
    let rawContent;
    try {
        rawContent = await fs.readFile(
            chatbotConfig.rag.testQuestionsPath,
            "utf8",
        );
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }

    return rawContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
            try {
                return JSON.parse(line);
            } catch (error) {
                throw new Error(`Invalid test_question.jsonl at line ${index + 1}`);
            }
        });
};

const pickQuestion = (record) => (
    record.question ||
    record.message ||
    record.input ||
    record.query ||
    ""
);

const pickExpectedAnswer = (record) => (
    record.expected_answer ||
    record.expectedAnswer ||
    record.answer ||
    ""
);

const run = async () => {
    const testRecords = await readTestQuestions();

    if (testRecords.length === 0) {
        console.log(
            `No test questions found at ${chatbotConfig.rag.testQuestionsPath}`,
        );
        return;
    }

    for (const record of testRecords) {
        const question = String(pickQuestion(record)).trim();
        if (!question) {
            continue;
        }

        try {
            const result = await chatbotService.chat(question);

            console.log("=".repeat(80));
            console.log(`question: ${question}`);
            console.log(`expected_answer: ${pickExpectedAnswer(record)}`);
            console.log(`actual_answer: ${result.answer}`);
            console.log("sources:");
            console.log(JSON.stringify(result.sources, null, 2));
        } catch (error) {
            console.log("=".repeat(80));
            console.log(`question: ${question}`);
            console.log(`error: ${error.message}`);
        }
    }
};

run().catch((error) => {
    console.error(`[testChatbot] ${error.message}`);
    process.exit(1);
});
