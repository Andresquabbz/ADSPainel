import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EditorHeader, type ViewportMode } from "@/components/editor/EditorHeader";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { LivePreviewCanvas } from "@/components/editor/LivePreviewCanvas";
import type { AnySection } from "@/components/editor/AddSectionModal";

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
  content: { cnpj?: string | null; generated?: boolean } | null;
}

interface SitePageRow {
  id: string;
  site_id: string;
  title: string;
  path: string;
  sections: unknown;
  seo: { title?: string; description?: string } | null;
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

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync loaded site data into draft state once loaded
  useEffect(() => {
    if (site && !isInitialized) {
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
      } | null;
      setMetaVerificationTag(
        siteContent?.facebook_domain_verification ||
          siteContent?.meta_tag ||
          ""
      );

      if (page) {
        const initialSections = Array.isArray(page.sections)
          ? (page.sections as AnySection[])
          : [];
        setSections(initialSections);
        setSeoTitle(page.seo?.title || `${site.name} — ${site.category || ""}`);
        setSeoDescription(
          page.seo?.description || `${site.business_name}. Entre em contato.`
        );
      }

      setIsInitialized(true);
    }
  }, [site, page, isInitialized]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, authLoading, navigate]);

  // ── 4. Unsaved changes detection ─────────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    if (!site || !isInitialized) return false;

    const originalSections = Array.isArray(page?.sections) ? page?.sections : [];
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
      // 1. Update site row
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
            ...site.content,
            cnpj: cnpj.trim() || null,
            facebook_domain_verification: metaVerificationTag.trim() || null,
          },
        })
        .eq("id", site.id);

      if (siteUpdateError) throw siteUpdateError;

      // 2. Update or insert site_page
      if (page?.id) {
        const { error: pageUpdateError } = await supabase
          .from("site_pages")
          .update({
            sections: sections,
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
            sections: sections,
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
        />

        <LivePreviewCanvas
          sections={sections}
          viewport={viewport}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
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
        />
      </div>
    </div>
  );
}
