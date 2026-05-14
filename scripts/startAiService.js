require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");

const resolveFromRoot = (value) => (
    path.isAbsolute(value) ? value : path.resolve(projectRoot, value)
);

const getPortFromEmbeddingUrl = () => {
    try {
        const embeddingUrl = new URL(
            process.env.EMBEDDING_API_URL || "http://127.0.0.1:8001/embed",
        );
        return embeddingUrl.port || (embeddingUrl.protocol === "https:" ? "443" : "80");
    } catch (error) {
        return "8001";
    }
};

const aiServiceDir = resolveFromRoot(
    process.env.AI_SERVICE_DIR || "ai-service",
);
const pythonExecutable =
    process.env.AI_SERVICE_PYTHON ||
    path.join(
        aiServiceDir,
        ".venv",
        process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
    );
const host = process.env.AI_SERVICE_HOST || "127.0.0.1";
const port = process.env.AI_SERVICE_PORT || getPortFromEmbeddingUrl();

const appPath = path.join(aiServiceDir, "app.py");

if (!fs.existsSync(appPath)) {
    console.error(`[chatbot:ai] app.py not found: ${appPath}`);
    process.exit(1);
}

if (!fs.existsSync(pythonExecutable)) {
    console.error(`[chatbot:ai] Python executable not found: ${pythonExecutable}`);
    console.error("[chatbot:ai] Create the AI service venv or set AI_SERVICE_PYTHON.");
    process.exit(1);
}

console.log(`[chatbot:ai] Starting AI service from ${aiServiceDir}`);
console.log(`[chatbot:ai] URL: http://${host}:${port}`);

const child = spawn(
    pythonExecutable,
    ["-m", "uvicorn", "app:app", "--host", host, "--port", String(port)],
    {
        cwd: aiServiceDir,
        stdio: "inherit",
        windowsHide: false,
    },
);

child.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(code || 0);
});
