import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={`language-toggle ${dark ? "language-toggle--dark" : ""}`} role="group" aria-label="Language">
      <Languages size={15} />
      <button className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
      <span aria-hidden="true">/</span>
      <button className={language === "ta" ? "is-active" : ""} onClick={() => setLanguage("ta")} type="button">தமிழ்</button>
    </div>
  );
}
