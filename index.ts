import express from "express";
import type{Express,Request,Response} from "express";
import {env} from "./src/config/env";
import { requireApiKey } from "./src/middleware/apiKeyAuth";
import v1Router from "./src/v1/routes";
import recordRouter from "./src/v1/routes/recordRoutes";
import apiKeyRouter from "./src/v1/routes/apiKeyRoutes";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./src/config/openapi";
import cors from "cors";

const app:Express = express();
app.use(cors());
app.use(express.json());
app.get("/api/docs.json", (_request, response) => response.json(openApiDocument));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use(requireApiKey);
app.use("/api/v1/workouts",v1Router);
app.use("/api/v1/records",recordRouter);
app.use("/api/v1/api-key",apiKeyRouter);


app.listen(env.port,() => console.log(`Servidor en el puerto ${env.port}`));