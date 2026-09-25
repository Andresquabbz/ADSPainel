import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EditorHeader, type ViewportMode } from "@/components/editor/EditorHeader";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { LivePreviewCanvas } from "@/components/editor/LivePreviewCanvas";
import type { AnySection } from "@/components/editor/AddSectionModal";
import { generatePageSections } from "@/lib/content-generator";
import type { CompanyData } from "@/lib/templates/institutional-template";
import { INITIAL_COMPANY_DATA } from "@/lib/templates/institutional-template";

export const Route = createFileRoute("/editor/$siteId")({
  component: EditorPage,
});

interface SiteRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  business_name: string;
  category: string | null;
  goal: string | null;
  style: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  description: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  status: string;
  content: { cnpj?: string | null; generated?: boolean; sections?: AnySection[]; [key: string]: any } | null;
}

interface SitePageRow {
  id: string;
  site_id: string;
  title: string;
  path: string;
  sections: AnySection[] | unknown;
  seo: { title?: string; description?: string; facebook_domain_verification?: string | null } | null;
  position: number;
}

function EditorPage() {
  const { siteId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── 1. Fetch site data ───────────────────────────────────────────────────
  const {
    data: site,
    isLoading: siteLoading,
    error: siteError,
  } = useQuery({
    queryKey: ["editor-site", siteId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("id", siteId)
        .single();
      if (error) throw error;
      return data as SiteRow;
    },
  });

  // ── 2. Fetch primary page ────────────────────────────────────────────────
  const {
    data: page,
    isLoading: pageLoading,
  } = useQuery({
    queryKey: ["editor-page", siteId],
    enabled: !!site?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_pages")
        .select("*")
        .eq("site_id", siteId)
        .order("position")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SitePageRow | null;
    },
  });

  // ── 3. Draft State (Local Edits) ─────────────────────────────────────────
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#e2603a");
  const [fontFamily, setFontFamily] = useState("Hanken Grotesk");
  const [style, setStyle] = useState("Moderno");

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [metaVerificationTag, setMetaVerificationTag] = useState("");

  // Sections
  const [sections, setSections] = useState<AnySection[]>([]);

  // Company Data for Institutional Template
  const [companyData, setCompanyData] = useState<CompanyData>(INITIAL_COMPANY_DATA);

  /**
   * Bidirectional sync: updates companyData AND patches the corresponding
   * section objects in real-time so LivePreviewCanvas reflects edits instantly.
   */
  const handleUpdateCompanyData = useCallback(
    (updater: (prev: CompanyData) => CompanyData) => {
      setCompanyData((prev) => {
        const next = updater(prev);

        // Patch sections that mirror companyData fields
        setSections((prevSections) =>
          prevSections.map((s) => {
            switch (s.type) {
              case "hero":
                return {
                  ...s,
                  badge: next.hero_badge ?? s.badge,
                  title: next.name || s.title,
                  subtitle: next.hero_subtitle ?? s.subtitle,
                };
              case "mission":
                return {
                  ...s,
                  title: next.mission_title || s.title,
                  description: next.mission_description || s.description,
                  // pillars only when they come from AI (array)
                  ...((next as any).pillars ? { pillars: (next as any).pillars } : {}),
                };
              case "about":
                return {
                  ...s,
                  title: next.about_title || s.title,
                  highlight: next.about_highlight || s.highlight,
                  body: next.about_description || s.body,
                  foundation_year: next.foundation_year || s.foundation_year,
                  activity_area: next.activity_area || s.activity_area,
                };
              case "company_services":
                return {
                  ...s,
                  title: next.services_title || s.title,
                  subtitle: next.services_subtitle || s.subtitle,
                  items:
                    next.services && next.services.length > 0
                      ? next.services
                      : s.items,
                };
              case "company_info":
                return {
                  ...s,
                  legal_name: next.legal_name || s.legal_name,
                  fantasy_name: next.fantasy_name || s.fantasy_name,
                  cnpj: next.cnpj || s.cnpj,
                  opening_date: next.opening_date || s.opening_date,
                  company_size: next.company_size || s.company_size,
                  legal_nature: next.legal_nature || s.legal_nature,
                  registration_status:
                    next.registration_status || s.registration_status,
                  company_type: next.company_type || s.company_type,
                  share_capital: next.share_capital || s.share_capital,
                };
              case "location":
                return {
                  ...s,
                  address_street: next.address_street || s.address_street,
                  address_number: next.address_number || s.address_number,
                  address_complement:
                    next.address_complement || s.address_complement,
                  address_neighborhood:
                    next.address_neighborhood || s.address_neighborhood,
                  address_city: next.address_city || s.address_city,
                  address_state: next.address_state || s.address_state,
                  address_cep: next.address_cep || s.address_cep,
                };
              case "contact":
                return {
                  ...s,
                  phone: next.phone || s.phone,
                  whatsapp: next.whatsapp || s.whatsapp,
                  email: next.email || s.email,
                  website: next.website || s.website,
                  instagram: next.instagram || s.instagram,
                  facebook: next.facebook || s.facebook,
                  linkedin: next.linkedin || s.linkedin,
                  youtube: next.youtube || s.youtube,
                  tiktok: next.tiktok || s.tiktok,
                };
              case "privacy_policy":
                return {
                  ...s,
                  body: next.privacy?.policy_text || s.body,
                  terms_text: next.privacy?.terms_text || s.terms_text,
                  dpo_contact:
                    next.privacy?.dpo_contact || next.email || s.dpo_contact,
                };
              default:
                return s;
            }
          })
        );

        return next;
      });
    },
    []
  );

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Admin and permission restriction state
  const ADMIN_EMAILS = ["andre.jesus.rocha@gmail.com"];
  const isAdmin = ADMIN_EMAILS.includes((user?.email || "").toLowerCase());
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const isRestricted = !isAdmin || !adminUnlocked;

  // Sync loaded site data into draft state once both site AND page are loaded
  useEffect(() => {
    if (site && !pageLoading && !isInitialized) {
      setName(site.name || "");
      setBusinessName(site.business_name || "");
      setCnpj(site.content?.cnpj || "");
      setWhatsapp(site.whatsapp || "");
      setPhone(site.phone || "");
      setEmail(site.email || "");
      setCity(site.city || "");
      setState(site.state || "");
      setAddress(site.address || "");
      setPrimaryColor(site.primary_color || "#e2603a");
      setFontFamily(site.font_family || "Hanken Grotesk");
      setStyle(site.style || "Moderno");

      const siteContent = site.content as {
        facebook_domain_verification?: string;
        meta_tag?: string;
        sections?: AnySection[];
        company_data?: CompanyData;
      } | null;

      // Load or build company data
      if (siteContent?.company_data) {
        setCompanyData(siteContent.company_data);
      } else {
        setCompanyData({
          ...INITIAL_COMPANY_DATA,
          name: site.name || INITIAL_COMPANY_DATA.name,
          fantasy_name: site.name || INITIAL_COMPANY_DATA.fantasy_name,
          legal_name: site.business_name || site.name || INITIAL_COMPANY_DATA.legal_name,
          cnpj: site.content?.cnpj || INITIAL_COMPANY_DATA.cnpj,
          phone: site.phone || INITIAL_COMPANY_DATA.phone,
          whatsapp: site.whatsapp || INITIAL_COMPANY_DATA.whatsapp,
          email: site.email || INITIAL_COMPANY_DATA.email,
          address_city: site.city || INITIAL_COMPANY_DATA.address_city,
          address_state: site.state || INITIAL_COMPANY_DATA.address_state,
          address_street: site.address || INITIAL_COMPANY_DATA.address_street,
        });
      }

      setMetaVerificationTag(
        siteContent?.facebook_domain_verification ||
          siteContent?.meta_tag ||
          ""
      );

      // Safe multi-tier fallback to NEVER lose or clear sections:
      // 1. From page.sections if it's an array with items
      // 2. From site.content.sections (redundant backup)
      // 3. Fallback to template generator if site had zero sections
      let loadedSections: AnySection[] = [];
      if (page && Array.isArray(page.sections) && page.sections.length > 0) {
        loadedSections = page.sections as AnySection[];
      } else if (siteContent?.sections && Array.isArray(siteContent.sections) && siteContent.sections.length > 0) {
        loadedSections = siteContent.sections as AnySection[];
      } else {
        loadedSections = generatePageSections({
          name: site.name || "Meu Negócio",
          business_name: site.business_name || site.name || "Minha Empresa",
          category: site.category ?? null,
          goal: site.goal ?? null,
          phone: site.phone ?? null,
          whatsapp: site.whatsapp ?? null,
          email: site.email ?? null,
          city: site.city ?? null,
          state: site.state ?? null,
          style: site.style ?? null,
        }) as AnySection[];
      }

      setSections(loadedSections);
      setSeoTitle(page?.seo?.title || `${site.name} — ${site.category || ""}`);
      setSeoDescription(
        page?.seo?.description || `${site.business_name}. Entre em contato.`
      );

      setIsInitialized(true);
    }
  }, [site, page, pageLoading, isInitialized]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, authLoading, navigate]);

  // ── 4. Unsaved changes detection ─────────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    if (!site || !isInitialized) return false;

    const originalSections =
      (Array.isArray(page?.sections) && page.sections.length > 0
        ? page.sections
        : (site.content as Record<string, unknown>)?.["sections"]) || [];
    const sectionsChanged =
      JSON.stringify(sections) !== JSON.stringify(originalSections);

    return (
      sectionsChanged ||
      name !== (site.name || "") ||
      businessName !== (site.business_name || "") ||
      cnpj !== (site.content?.cnpj || "") ||
      whatsapp !== (site.whatsapp || "") ||
      phone !== (site.phone || "") ||
      email !== (site.email || "") ||
      city !== (site.city || "") ||
      state !== (site.state || "") ||
      address !== (site.address || "") ||
      primaryColor !== (site.primary_color || "#e2603a") ||
      fontFamily !== (site.font_family || "Hanken Grotesk") ||
      style !== (site.style || "Moderno") ||
      seoTitle !== (page?.seo?.title || "") ||
      seoDescription !== (page?.seo?.description || "") ||
      metaVerificationTag !==
        ((site.content as { facebook_domain_verification?: string; meta_tag?: string })?.facebook_domain_verification ||
          (site.content as { facebook_domain_verification?: string; meta_tag?: string })?.meta_tag ||
          "")
    );
  }, [
    site,
    page,
    isInitialized,
    sections,
    name,
    businessName,
    cnpj,
    whatsapp,
    phone,
    email,
    city,
    state,
    address,
    primaryColor,
    fontFamily,
    style,
    seoTitle,
    seoDescription,
    metaVerificationTag,
  ]);

  // ── 5. Save action ───────────────────────────────────────────────────────
  async function handleSave() {
    if (!site) return;
    setIsSaving(true);
    try {
      if (sections.length === 0) {
        toast.error("O site precisa ter pelo menos uma seção.");
        setIsSaving(false);
        return;
      }

      // 1. Update site row and persist redundant copy of sections
      const existingContent = (site.content as Record<string, unknown>) || {};
      const { error: siteUpdateError } = await supabase
        .from("sites")
        .update({
          name: name.trim(),
          business_name: businessName.trim(),
          primary_color: primaryColor,
          font_family: fontFamily,
          style: style,
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          email: email.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          address: address.trim() || null,
          content: {
            ...existingContent,
            cnpj: cnpj.trim() || null,
            facebook_domain_verification: metaVerificationTag.trim() || null,
            company_data: companyData,
            sections: sections as any,
          },
        })
        .eq("id", site.id);

      if (siteUpdateError) throw siteUpdateError;

      // 2. Update or insert site_page
      if (page?.id) {
        const { error: pageUpdateError } = await supabase
          .from("site_pages")
          .update({
            sections: sections as any,
            seo: {
              title: seoTitle.trim(),
              description: seoDescription.trim(),
              facebook_domain_verification: metaVerificationTag.trim() || null,
            },
          })
          .eq("id", page.id);

        if (pageUpdateError) throw pageUpdateError;
      } else {
        const { error: pageInsertError } = await supabase
          .from("site_pages")
          .insert({
            site_id: site.id,
            user_id: user!.id,
            title: "Página inicial",
            path: "/",
            position: 0,
            sections: sections as any,
            seo: {
              title: seoTitle.trim(),
              description: seoDescription.trim(),
              facebook_domain_verification: metaVerificationTag.trim() || null,
            },
          });

        if (pageInsertError) throw pageInsertError;
      }

      await queryClient.invalidateQueries({ queryKey: ["editor-site", siteId] });
      await queryClient.invalidateQueries({ queryKey: ["editor-page", siteId] });
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.invalidateQueries({ queryKey: ["preview-site", site.slug] });
      await queryClient.invalidateQueries({ queryKey: ["preview-pages", site.id] });

      toast.success("Alterações salvas com sucesso! ✨");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  }

  // ── 6. Publish / Unpublish ───────────────────────────────────────────────
  async function handleTogglePublish() {
    if (!site) return;
    setIsPublishing(true);
    const nextStatus = site.status === "published" ? "draft" : "published";

    try {
      // If saving is needed, save first
      if (hasUnsavedChanges) {
        await handleSave();
      }

      const { error } = await supabase
        .from("sites")
        .update({ status: nextStatus })
        .eq("id", site.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["editor-site", siteId] });
      await queryClient.invalidateQueries({ queryKey: ["sites"] });

      if (nextStatus === "published") {
        toast.success("Site publicado com sucesso! 🚀", {
          description: "Seu site está no ar para todos os visitantes.",
        });
      } else {
        toast.info("Site despublicado.", {
          description: "O site voltou para o modo rascunho.",
        });
      }
    } catch {
      toast.error("Erro ao alterar status de publicação.");
    } finally {
      setIsPublishing(false);
    }
  }

  // ── 7. Ctrl + S keyboard shortcut ────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleSave();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Loading Screen
  if (siteLoading || pageLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Carregando editor de site...
        </p>
      </div>
    );
  }

  if (siteError || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm text-destructive font-medium">
          Site não encontrado ou você não tem permissão para editá-lo.
        </p>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="text-xs text-primary underline"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <EditorHeader
        siteName={name || site.name}
        siteSlug={site.slug}
        status={site.status}
        viewport={viewport}
        onChangeViewport={setViewport}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        isPublishing={isPublishing}
        onTogglePublish={handleTogglePublish}
        isAdmin={isAdmin}
        adminUnlocked={adminUnlocked}
        onToggleAdminUnlock={() => setAdminUnlocked((prev) => !prev)}
      />

      {/* ── Main Area: Sidebar + Live Preview Canvas ──────────────── */}
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          sections={sections}
          onChangeSections={setSections}
          selectedSectionIndex={selectedSectionIndex}
          onSelectSection={setSelectedSectionIndex}
          // Theme
          primaryColor={primaryColor}
          onChangePrimaryColor={setPrimaryColor}
          fontFamily={fontFamily}
          onChangeFontFamily={setFontFamily}
          style={style}
          onChangeStyle={setStyle}
          // Contact
          name={name}
          onChangeName={setName}
          businessName={businessName}
          onChangeBusinessName={setBusinessName}
          cnpj={cnpj}
          onChangeCnpj={setCnpj}
          whatsapp={whatsapp}
          onChangeWhatsapp={setWhatsapp}
          phone={phone}
          onChangePhone={setPhone}
          email={email}
          onChangeEmail={setEmail}
          city={city}
          onChangeCity={setCity}
          state={state}
          onChangeState={setState}
          address={address}
          onChangeAddress={setAddress}
          // SEO
          seoTitle={seoTitle}
          onChangeSeoTitle={setSeoTitle}
          seoDescription={seoDescription}
          onChangeSeoDescription={setSeoDescription}
          metaVerificationTag={metaVerificationTag}
          onChangeMetaVerificationTag={setMetaVerificationTag}
          siteSlug={site.slug}
          category={site.category || "Geral"}
          isRestricted={isRestricted}
          companyData={companyData}
          onChangeCompanyData={handleUpdateCompanyData}
        />

        <LivePreviewCanvas
          sections={sections}
          viewport={viewport}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          style={style}
          name={name}
          businessName={businessName}
          cnpj={cnpj}
          whatsapp={whatsapp}
          phone={phone}
          email={email}
          city={city}
          state={state}
          address={address}
          selectedSectionIndex={selectedSectionIndex}
          onSelectSection={setSelectedSectionIndex}
          companyData={companyData}
        />
      </div>
    </div>
  );
}
