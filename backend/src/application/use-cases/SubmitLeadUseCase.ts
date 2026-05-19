import type { CreateLeadInput, Lead } from "../../domain/entities/Lead.js";
import type { ILeadRepository } from "../../domain/repositories/ILeadRepository.js";
import type { SubmitLeadDto } from "../dto/SubmitLeadDto.js";

export class SubmitLeadUseCase {
  constructor(private readonly leads: ILeadRepository) {}

  async execute(dto: SubmitLeadDto): Promise<Lead> {
    const phone = dto.phone?.trim() || null;
    const email = dto.email?.trim() || null;
    const contact = dto.contact?.trim() || null;

    if (!phone && !email && !contact) {
      throw new ValidationError("Укажите телефон, email или другой контакт");
    }

    const input: CreateLeadInput = {
      formId: dto.form,
      name: dto.name.trim(),
      phone,
      email,
      contact,
      service: dto.service?.trim() || null,
      message: dto.message?.trim() || null,
      pageUrl: dto.page?.trim() || null,
      utmSource: dto.utm_source?.trim() || null,
      utmMedium: dto.utm_medium?.trim() || null,
      utmCampaign: dto.utm_campaign?.trim() || null,
      utmContent: dto.utm_content?.trim() || null,
      utmTerm: dto.utm_term?.trim() || null,
    };

    return this.leads.create(input);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
