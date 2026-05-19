import cors from "cors";
import express from "express";
import { SubmitLeadUseCase } from "../../application/use-cases/SubmitLeadUseCase.js";
import { PostgresLeadRepository } from "../../infrastructure/repositories/PostgresLeadRepository.js";
import { createLeadsRouter } from "./routes/leads.js";

export function createApp() {
  const app = express();

  const corsOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      methods: ["GET", "POST", "OPTIONS"],
    })
  );
  app.use(express.json({ limit: "32kb" }));

  const leadRepo = new PostgresLeadRepository();
  const submitLead = new SubmitLeadUseCase(leadRepo);

  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", service: "idm-backend" });
  });

  app.use("/api/v1/leads", createLeadsRouter(submitLead));

  return app;
}
