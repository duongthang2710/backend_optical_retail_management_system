const http = require("http");
const https = require("https");

const parseResponseBody = (body) => {
    if (!body) {
        return null;
    }

    try {
        return JSON.parse(body);
    } catch (error) {
        return body;
    }
};

const extractErrorMessage = (parsedBody, fallback) => {
    if (!parsedBody || typeof parsedBody === "string") {
        return typeof parsedBody === "string" && parsedBody
            ? parsedBody
            : fallback;
    }

    return (
        parsedBody.message ||
        parsedBody.error?.message ||
        parsedBody.error ||
        fallback
    );
};

const postJson = (urlString, payload, options = {}) => {
    if (!urlString) {
        return Promise.reject(new Error("Request URL is required"));
    }

    return new Promise((resolve, reject) => {
        let parsedUrl;
        try {
            parsedUrl = new URL(urlString);
        } catch (error) {
            reject(new Error(`Invalid request URL: ${urlString}`));
            return;
        }

        const requestBody = JSON.stringify(payload || {});
        const transport = parsedUrl.protocol === "https:" ? https : http;
        const requestOptions = {
            method: "POST",
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || undefined,
            path: `${parsedUrl.pathname}${parsedUrl.search}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Content-Length": Buffer.byteLength(requestBody),
                ...(options.headers || {}),
            },
        };

        const req = transport.request(requestOptions, (res) => {
            let responseBody = "";

            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                responseBody += chunk;
            });
            res.on("end", () => {
                const parsedBody = parseResponseBody(responseBody);
                const statusCode = res.statusCode || 500;

                if (statusCode >= 400) {
                    const error = new Error(
                        extractErrorMessage(
                            parsedBody,
                            `HTTP request failed with status ${statusCode}`,
                        ),
                    );
                    error.status = statusCode;
                    reject(error);
                    return;
                }

                resolve(parsedBody);
            });
        });

        req.on("error", (error) => {
            if (!error.message) {
                error.message = `Cannot connect to ${urlString}`;
            }
            reject(error);
        });

        if (options.timeoutMs) {
            req.setTimeout(options.timeoutMs, () => {
                req.destroy(
                    new Error(
                        `HTTP request timed out after ${options.timeoutMs}ms`,
                    ),
                );
            });
        }

        req.write(requestBody);
        req.end();
    });
};

module.exports = {
    postJson,
};
