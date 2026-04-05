export interface ParsedLead {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  companySize?: number;
  industry?: string;
}

export const parseCSV = (csvText: string): ParsedLead[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));

  const leads: ParsedLead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    if (values.length < 2) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });

    // Map common column name variations
    const email =
      row["email"] || row["emailaddress"] || row["workemail"] || "";
    const firstName =
      row["firstname"] || row["first"] || row["fname"] || 
      (row["name"] ? row["name"].split(" ")[0] : "") || "";
    const lastName =
      row["lastname"] || row["last"] || row["lname"] ||
      (row["name"] ? row["name"].split(" ").slice(1).join(" ") : "") || "";
    const company =
      row["company"] || row["companyname"] || row["organization"] || "";
    const title =
      row["title"] || row["jobtitle"] || row["role"] || row["position"] || "";

    if (!email || !firstName || !company) continue;

    leads.push({
      email,
      firstName,
      lastName: lastName || "",
      company,
      title: title || "Unknown",
      linkedinUrl: row["linkedin"] || row["linkedinurl"] || undefined,
      companySize: row["companysize"] || row["employees"]
        ? Number(row["companysize"] || row["employees"])
        : undefined,
      industry: row["industry"] || row["sector"] || undefined,
    });
  }

  if (leads.length === 0) {
    throw new Error(
      "No valid leads found. CSV must have: email, firstName (or name), company columns"
    );
  }

  return leads;
};