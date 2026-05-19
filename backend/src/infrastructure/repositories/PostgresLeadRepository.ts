import type { CreateLeadInput, Lead } from "../../domain/entities/Lead.js";
import type { ILeadRepository } from "../../domain/repositories/ILeadRepository.js";
import { getPool } from "../database/pool.js";

function mapRow(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    formId: String(row.form_id),
    name: String(row.name),
    phone: row.phone != null ? String(row.phone) : null,
    email: row.email != null ? String(row.email) : null,
    contact: row.contact != null ? String(row.contact) : null,
    service: row.service != null ? String(row.service) : null,
    message: row.message != null ? String(row.message) : null,
    pageUrl: row.page_url != null ? String(row.page_url) : null,
    utmSource: row.utm_source != null ? String(row.utm_source) : null,
    utmMedium: row.utm_medium != null ? String(row.utm_medium) : null,
    utmCampaign: row.utm_campaign != null ? String(row.utm_campaign) : null,
    utmContent: row.utm_content != null ? String(row.utm_content) : null,
    utmTerm: row.utm_term != null ? String(row.utm_term) : null,
    status: row.status as Lead["status"],
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
}

export class PostgresLeadRepository implements ILeadRepository {
  async create(input: CreateLeadInput): Promise<Lead> {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO leads (
        form_id, name, phone, email, contact, service, message, page_url,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        input.formId,
        input.name,
        input.phone ?? null,
        input.email ?? null,
        input.contact ?? null,
        input.service ?? null,
        input.message ?? null,
        input.pageUrl ?? null,
        input.utmSource ?? null,
        input.utmMedium ?? null,
        input.utmCampaign ?? null,
        input.utmContent ?? null,
        input.utmTerm ?? null,
      ]
    );
    return mapRow(rows[0] as Record<string, unknown>);
  }
}
