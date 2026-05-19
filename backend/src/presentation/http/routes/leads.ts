import { Router } from "express";
import { submitLeadSchema } from "../../../application/dto/SubmitLeadDto.js";
import {
  SubmitLeadUseCase,
  ValidationError,
} from "../../../application/use-cases/SubmitLeadUseCase.js";

export function createLeadsRouter(submitLead: SubmitLeadUseCase): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    const parsed = submitLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation_error",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const lead = await submitLead.execute(parsed.data);
      res.status(201).json({
        ok: true,
        id: lead.id,
        status: lead.status,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: "validation_error", message: err.message });
        return;
      }
      console.error("[leads]", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}
