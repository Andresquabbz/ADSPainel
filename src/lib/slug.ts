import { RESERVED_SLUGS } from "@/config/app";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cleans a Brazilian business or MEI name.
 * Often MEI names come from CNPJ lookup as "19.746.439 FERNANDO SORRILHA" or "FERNANDO SORRILHA 19746439".
 * This removes CNPJ/CPF numbers, corporate suffixes (LTDA, ME), and formats nicely.
 */
export function cleanBusinessName(raw: string): string {
  if (!raw) return "";
  let name = raw.trim();

  // Remove leading CNPJ/CPF formatted or unformatted: e.g. "19.746.439 ", "19746439 ", "19.746.439/0001-00 "
  name = name.replace(/^[\d\.\-\/]{7,22}\s+[-–—]?\s*/, "");

  // Remove trailing CNPJ/CPF or numbers: e.g. " 19.746.439", " 19746439000100"
  name = name.replace(/\s+[-–—]?\s*[\d\.\-\/]{7,22}$/, "");

  // Remove trailing legal entity abbreviations
  name = name.replace(/\s+(ltda|me|epp|eireli|s\/?a|mei)\b/gi, "");

  // If entirely in UPPERCASE, convert to Title Case
  if (name === name.toUpperCase() && name.length > 2) {
    name = name
      .toLowerCase()
      .split(" ")
      .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  return name.trim();
}

/**
 * Cleans and converts any text into a concise, URL-friendly slug.
 * Strips CNPJ prefixes/suffixes, punctuation, diacritics, and corporate entity words.
 * Example: "19.746.439 Fernando Sorrilha" -> "fernando-sorrilha"
 */
export function cleanSlug(text: string): string {
  if (!text) return "site";

  let s = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric to hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens

  // Remove CNPJ/CPF patterns from beginning (e.g. "19-746-439-fernando-sorrilha" or "19746439-")
  s = s.replace(/^(?:\d{1,4}-){2,}\d{1,4}-?/, "");
  s = s.replace(/^\d{6,14}-?/, "");

  // Remove CNPJ/CPF patterns from end (e.g. "-19-746-439" or "-19746439")
  s = s.replace(/-(?:\d{1,4}-){2,}\d{1,4}$/, "");
  s = s.replace(/-\d{6,14}$/, "");

  // Remove legal entities from end of slug
  s = s.replace(/-(?:ltda|me|epp|eireli|s-a|sa|mei)$/, "");

  // Trim hyphens again
  s = s.replace(/^-+|-+$/g, "");

  // If everything was stripped (e.g. company name was purely a number), fallback to basic alphanumeric
  if (!s) {
    s = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Cap at 36 characters and clean trailing hyphens
  s = s.slice(0, 36).replace(/-+$/, "");

  return s || "site";
}

/**
 * Validates a user-provided slug string.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateSlug(slug: string): string | null {
  const trimmed = slug.trim().toLowerCase();
  if (trimmed.length < 3) {
    return "O subdomínio deve ter pelo menos 3 caracteres.";
  }
  if (trimmed.length > 36) {
    return "O subdomínio deve ter no máximo 36 caracteres.";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return "Use apenas letras minúsculas, números e hífens (sem espaços ou pontos).";
  }
  if (RESERVED_SLUGS.includes(trimmed)) {
    return "Este subdomínio é reservado pelo sistema. Por favor, escolha outro.";
  }
  return null;
}

/**
 * Generates an available, clean, unique slug.
 * It will first try the clean slug directly (e.g. "fernando-sorrilha").
 * Only if that exact slug already exists, it checks "fernando-sorrilha-2", "fernando-sorrilha-3", etc.
 */
export async function findAvailableSlug(
  supabase: SupabaseClient,
  rawName: string,
  excludeSiteId?: string
): Promise<string> {
  const base = cleanSlug(rawName);
  let candidate = base;

  // If candidate is a reserved word, append "-site"
  if (RESERVED_SLUGS.includes(candidate)) {
    candidate = `${candidate}-site`;
  }

  // Check if candidate is available
  let query = supabase.from("sites").select("id").eq("slug", candidate);
  if (excludeSiteId) {
    query = query.neq("id", excludeSiteId);
  }
  const { data: existing } = await query.maybeSingle();

  if (!existing) {
    return candidate;
  }

  // If taken, try candidate-2, candidate-3, ... up to candidate-25
  for (let i = 2; i <= 25; i++) {
    const nextCandidate = `${candidate}-${i}`;
    let nextQuery = supabase.from("sites").select("id").eq("slug", nextCandidate);
    if (excludeSiteId) {
      nextQuery = nextQuery.neq("id", excludeSiteId);
    }
    const { data: nextExisting } = await nextQuery.maybeSingle();
    if (!nextExisting) {
      return nextCandidate;
    }
  }

  // Extremely rare collision fallback: short 4-char suffix
  return `${candidate}-${Math.random().toString(36).slice(2, 6)}`;
}
