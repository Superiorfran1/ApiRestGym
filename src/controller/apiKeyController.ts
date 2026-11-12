import type { Request, Response } from "express";
import { env } from "../config/env";

export function getApiKey(_request: Request, response: Response) {
    response.send({
        status: "ok",
        data: { apikey: env.apiKey }
    });
}
