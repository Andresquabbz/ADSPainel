import { useState } from "react";
import { toast } from "sonner";
import { submitLead } from "@/functions/submit-lead";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

interface PublicContactFormProps {
  siteId: string;
  primaryColor: string;
}

export function PublicContactForm({ siteId, primaryColor }: PublicContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hpCheck, setHpCheck] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      toast.error("Informe pelo menos um WhatsApp/telefone ou e-mail.");
      return;
    }
    if (!message.trim()) {
      toast.error("Por favor, escreva sua mensagem.");
      return;
    }

    setLoading(true);
    try {
      await submitLead({
        data: {
          siteId,
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || undefined,
          message: message.trim(),
          hp_check: hpCheck.trim() || null,
        },
      });

      setSubmitted(true);
      toast.success("Mensagem enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-8 rounded-xl border border-gray-200 bg-white text-center shadow-sm space-y-3 max-w-md mx-auto">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <h4 className="text-lg font-bold text-gray-900">Mensagem Enviada!</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Obrigado pelo contato. Nossa equipe responderá o mais breve possível.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setPhone("");
            setEmail("");
            setMessage("");
          }}
          className="text-xs font-semibold underline pt-2 text-gray-500 hover:text-gray-900"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white text-left shadow-sm space-y-4 max-w-lg mx-auto"
    >
      <h3 className="text-base font-bold text-gray-900">Envie uma Mensagem</h3>

      {/* Honeypot anti-bot trap (invisible to human visitors, caught by automated spambots) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          height: 0,
          width: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <label htmlFor="b_hp_check">Deixe este campo em branco</label>
        <input
          id="b_hp_check"
          type="text"
          name="b_hp_check_input"
          tabIndex={-1}
          autoComplete="off"
          value={hpCheck}
          onChange={(e) => setHpCheck(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Seu Nome *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como podemos te chamar?"
          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
          style={{ ["--tw-ring-color" as any]: primaryColor }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            WhatsApp / Telefone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Sua Mensagem *
        </label>
        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Como podemos te ajudar?"
          className="w-full p-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-lg text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar Mensagem
          </>
        )}
      </button>
    </form>
  );
}
