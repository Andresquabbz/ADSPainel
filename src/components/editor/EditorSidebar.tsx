import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layout, Palette, PhoneCall, Search, Lock } from "lucide-react";
import type { AnySection } from "./AddSectionModal";
import { SectionList } from "./SectionList";
import { ThemeTab } from "./ThemeTab";
import { ContactTab } from "./ContactTab";
import { SeoTab } from "./SeoTab";

interface EditorSidebarProps {
  sections: AnySection[];
  onChangeSections: (sections: AnySection[]) => void;
  selectedSectionIndex: number | null;
  onSelectSection: (index: number | null) => void;
  // Theme
  primaryColor: string;
  onChangePrimaryColor: (color: string) => void;
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  style: string;
  onChangeStyle: (style: string) => void;
  // Contact
  name: string;
  onChangeName: (name: string) => void;
  businessName: string;
  onChangeBusinessName: (bName: string) => void;
  cnpj: string;
  onChangeCnpj: (cnpj: string) => void;
  whatsapp: string;
  onChangeWhatsapp: (wpp: string) => void;
  phone: string;
  onChangePhone: (phone: string) => void;
  email: string;
  onChangeEmail: (email: string) => void;
  city: string;
  onChangeCity: (city: string) => void;
  state: string;
  onChangeState: (state: string) => void;
  address: string;
  onChangeAddress: (addr: string) => void;
  // SEO
  seoTitle: string;
  onChangeSeoTitle: (title: string) => void;
  seoDescription: string;
  onChangeSeoDescription: (desc: string) => void;
  metaVerificationTag: string;
  onChangeMetaVerificationTag: (tag: string) => void;
  siteSlug: string;
  category: string;
  isRestricted?: boolean;
}

export function EditorSidebar({
  sections,
  onChangeSections,
  selectedSectionIndex,
  onSelectSection,
  primaryColor,
  onChangePrimaryColor,
  fontFamily,
  onChangeFontFamily,
  style,
  onChangeStyle,
  name,
  onChangeName,
  businessName,
  onChangeBusinessName,
  cnpj,
  onChangeCnpj,
  whatsapp,
  onChangeWhatsapp,
  phone,
  onChangePhone,
  email,
  onChangeEmail,
  city,
  onChangeCity,
  state,
  onChangeState,
  address,
  onChangeAddress,
  seoTitle,
  onChangeSeoTitle,
  seoDescription,
  onChangeSeoDescription,
  metaVerificationTag,
  onChangeMetaVerificationTag,
  siteSlug,
  category,
  isRestricted = true,
}: EditorSidebarProps) {
  const [tab, setTab] = useState("sections");

  return (
    <div className="w-96 flex flex-col border-r border-border bg-card h-full shrink-0 overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
        {/* Tab Headers */}
        <div className="p-3 border-b border-border bg-muted/30">
          <TabsList className="grid grid-cols-4 w-full h-9">
            <TabsTrigger value="sections" className="text-xs px-2 gap-1.5" title="Seções">
              <Layout className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Seções</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-xs px-2 gap-1.5" title="Estilo">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Estilo</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs px-2 gap-1.5" title="Contato">
              <PhoneCall className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline font-bold">Contato</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs px-2 gap-1.5" title="SEO">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Panels (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="sections" className="mt-0">
            <SectionList
              sections={sections}
              onChange={onChangeSections}
              selectedSectionIndex={selectedSectionIndex}
              onSelectSection={onSelectSection}
              businessName={name || businessName}
              category={category}
            />
          </TabsContent>

          <TabsContent value="theme" className="mt-0">
            <ThemeTab
              primaryColor={primaryColor}
              onChangePrimaryColor={onChangePrimaryColor}
              fontFamily={fontFamily}
              onChangeFontFamily={onChangeFontFamily}
              style={style}
              onChangeStyle={onChangeStyle}
            />
          </TabsContent>

          <TabsContent value="contact" className="mt-0">
            <ContactTab
              name={name}
              onChangeName={onChangeName}
              businessName={businessName}
              onChangeBusinessName={onChangeBusinessName}
              cnpj={cnpj}
              onChangeCnpj={onChangeCnpj}
              whatsapp={whatsapp}
              onChangeWhatsapp={onChangeWhatsapp}
              phone={phone}
              onChangePhone={onChangePhone}
              email={email}
              onChangeEmail={onChangeEmail}
              city={city}
              onChangeCity={onChangeCity}
              state={state}
              onChangeState={onChangeState}
              address={address}
              onChangeAddress={onChangeAddress}
              isRestricted={isRestricted}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-0">
            <SeoTab
              seoTitle={seoTitle}
              onChangeSeoTitle={onChangeSeoTitle}
              seoDescription={seoDescription}
              onChangeSeoDescription={onChangeSeoDescription}
              metaVerificationTag={metaVerificationTag}
              onChangeMetaVerificationTag={onChangeMetaVerificationTag}
              siteSlug={siteSlug}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
