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
        // FUNDOS
        background: "#0f172a", // Azul Profundo (Slate 950)
        surface: "#1e293b",    // Azul/Cinza (Slate 800) - Para Cards
        
        // TEXTOS
        foreground: "#f1f5f9", // Branco Gelo (Slate 100)
        muted: "#94a3b8",      // Cinza Azulado (Slate 400)

        // BORDAS & LINHAS
        border: "#334155",     // Slate 700

        // DESTAQUES (Botões e Ícones)
        primary: "#818cf8",    // Indigo Neon
        "primary-hover": "#6366f1", 
        secondary: "#2dd4bf",  // Turquesa Neon (Teal 400)
        accent: "#f472b6",     // Rosa Neon
        
        // STATUS
        success: "#34d399",    // Verde
        warning: "#fbbf24",    // Amarelo
        danger: "#f87171",     // Vermelho Suave
      },
    },
  },
  plugins: [],
};
export default config;