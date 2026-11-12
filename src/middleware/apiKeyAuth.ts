import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function requireApiKey(request: Request, response: Response, next: NextFunction) {
    if (request.method !== "GET") {
        next();
        return;
    }

    if (request.path.replace(/\/+$/, "") === "/api/v1/api-key") {
        next();
        return;
    }

    if (!env.apiKey?.trim()) {
        response.status(503).send({
            status: "fail",
            data: "API key is not configured"
        });
        return;
    }

    const providedApiKey = request.query.apikey;
    if (
        typeof providedApiKey !== "string" ||
        Buffer.byteLength(providedApiKey) !== Buffer.byteLength(env.apiKey) ||
        !timingSafeEqual(Buffer.from(providedApiKey), Buffer.from(env.apiKey))
    ) {
        response.status(401).send({
            status: "fail",
            data: "A valid apikey query parameter is required"
        });
        return;
    }

    next();
}
