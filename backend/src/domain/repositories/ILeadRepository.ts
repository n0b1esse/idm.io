import type { CreateLeadInput, Lead } from "../entities/Lead.js";

export interface ILeadRepository {
  create(input: CreateLeadInput): Promise<Lead>;
}
