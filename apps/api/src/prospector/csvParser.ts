import { parse } from 'csv-parse/sync';

export interface ParsedLead {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  website?: string;
  phone?: string;
  qualityScore: number;
}

export interface ParseResult {
  leads: ParsedLead[];
  totalRows: number;
  skippedRows: number;
  parseErrors: string[];
}

export async function parseCsv(buffer: Buffer): Promise<ParseResult> {
  const result: ParseResult = {
    leads: [],
    totalRows: 0,
    skippedRows: 0,
    parseErrors: [],
  };

  try {
    const fileContent = buffer.toString('utf8');
    
    // Parse using csv-parse/sync
    const records = parse(fileContent, {
      columns: (header: string[]) => {
        // Normalize headers
        return header.map((h) => 
          h.toLowerCase().trim().replace(/\s+/g, '_')
        );
      },
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as any[];

    result.totalRows = records.length;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowIndex = i + 2; // Assuming row 1 is header

      const email = record.email;
      let firstName = record.first_name || '';
      let lastName = record.last_name || '';
      const name = record.name || '';
      const company = record.company || '';
      const title = record.title || '';
      const linkedinUrl = record.linkedin_url || '';
      const website = record.website || '';
      const phone = record.phone || '';

      // Validate core required existence
      if (!email && !name && !firstName && !lastName) {
        result.skippedRows++;
        continue; // Skip silently
      }

      if (email && !emailRegex.test(email)) {
        result.skippedRows++;
        result.parseErrors.push(`Row ${rowIndex}: Invalid email format (${email})`);
        continue;
      }

      // Name normalization
      if (!firstName && !lastName && name) {
        const parts = name.trim().split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      // We technically require (email) AND (name + company) or something? 
      // Prompt says: "Required columns (at least one of these must exist per row or row is skipped): email, name + company"
      // Wait, "at least one of these must exist per row or row is skipped): email OR (name AND company) --- wait, prompt says:
      // "Required columns (at least one of these must exist per row or row is skipped): email, name + company"
      // I will interpret as: requires email OR requires name+company.
      // But typically, email is essential for emailing.
      // "If both email and name are missing: Skip row silently"
      if (!email && !firstName && !lastName) {
         result.skippedRows++;
         continue;
      }

      let score = 0;
      if (email) score += 30;
      if (firstName || lastName) score += 20;
      if (company) score += 20;
      if (title) score += 15;
      if (linkedinUrl) score += 10;
      if (phone) score += 5;

      const lead: ParsedLead = {
        email: email || '',
        firstName: firstName,
        lastName: lastName,
        company: company,
        title: title,
        qualityScore: score,
      };

      if (linkedinUrl) lead.linkedinUrl = linkedinUrl;
      if (website) lead.website = website;
      if (phone) lead.phone = phone;

      result.leads.push(lead);
    }

  } catch (error: any) {
    result.parseErrors.push(`Failed to parse CSV structure: ${error.message}`);
  }

  return result;
}
