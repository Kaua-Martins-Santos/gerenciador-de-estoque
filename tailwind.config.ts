import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CORES PRINCIPAIS
        background: "#0f172a", // Fundo geral (Slate 950)
        foreground: "#f1f5f9", // Texto principal (Slate 100)
        
        surface: "#1e293b",    // Cards e Paineis (Slate 800)
        
        // Mapeamentos para componentes do ShadcnUI
        card: "#1e293b",       // Mapeia bg-card para surface
        "card-foreground": "#f1f5f9",
        
        popover: "#1e293b",    // Mapeia bg-popover para surface (Resolve o Combobox Transparente!)
        "popover-foreground": "#f1f5f9",
        
        muted: "#334155",      // Cinza mais escuro para fundos secundários
        "muted-foreground": "#94a3b8", // Texto secundário

        border: "#334155",     // Bordas (Slate 700)
        input: "#334155",      // Bordas de inputs

        // DESTAQUES
        primary: "#818cf8",    // Indigo Neon
        "primary-foreground": "#0f172a", // Texto preto no botão roxo
        
        secondary: "#2dd4bf",  // Turquesa
        "secondary-foreground": "#0f172a",

        accent: "#f472b6",     // Rosa
        "accent-foreground": "#0f172a",
        
        // STATUS
        destructive: "#f87171",
        "destructive-foreground": "#ffffff",
        success: "#34d399",
        warning: "#fbbf24",
      },
    },
  },
  plugins: [],
};
export default config;