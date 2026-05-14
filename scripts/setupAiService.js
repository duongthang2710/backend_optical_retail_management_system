require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");

const resolveFromRoot = (value) => (
    path.isAbsolute(value) ? value : path.resolve(projectRoot, value)
);

const aiServiceDir = resolveFromRoot(process.env.AI_SERVICE_DIR || "ai-service");
const venvDir = path.join(aiServiceDir, ".venv");
const pythonExecutable = path.join(
    venvDir,
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const requirementsPath = path.join(aiServiceDir, "requirements.txt");

const run = (command, args, options = {}) => {
    const result = spawnSync(command, args, {
        cwd: options.cwd || projectRoot,
        stdio: "inherit",
        shell: false,
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(" ")} failed`);
    }
};

if (!fs.existsSync(requirementsPath)) {
    console.error(`[chatbot:setup-ai] requirements.txt not found: ${requirementsPath}`);
    process.exit(1);
}

try {
    if (!fs.existsSync(pythonExecutable)) {
        console.log(`[chatbot:setup-ai] Creating venv at ${venvDir}`);
        run(process.env.PYTHON || "python", ["-m", "venv", venvDir]);
    }

    console.log("[chatbot:setup-ai] Upgrading pip");
    run(pythonExecutable, ["-m", "pip", "install", "--upgrade", "pip"]);

    console.log("[chatbot:setup-ai] Installing AI service requirements");
    run(pythonExecutable, ["-m", "pip", "install", "-r", requirementsPath]);

    console.log("[chatbot:setup-ai] Done");
} catch (error) {
    console.error(`[chatbot:setup-ai] ${error.message}`);
    process.exit(1);
}
