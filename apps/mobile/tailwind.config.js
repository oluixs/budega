/**
 * Tokens espelhados de DESIGN.md. NativeWind v4 usa Tailwind v3 (config JS), enquanto
 * apps/web usa Tailwind v4 (CSS-first) — os valores hexadecimais são mantidos
 * sincronizados manualmente entre os dois arquivos; DESIGN.md é a fonte da verdade.
 */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F1F8F3",
          100: "#DCEEE1",
          500: "#1F7A4D",
          600: "#175C3A",
          700: "#124A2F",
        },
        accent: {
          500: "#E2612E",
          600: "#C24E20",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#FAF8F5",
          100: "#F0ECE6",
          300: "#D8D2C7",
          500: "#706A5F",
          700: "#4A463D",
          900: "#211F1A",
        },
        success: "#1F7A4D",
        warning: "#B8871E",
        danger: "#C0392B",
        info: "#2563A3",
      },
      borderRadius: {
        md: 12,
        lg: 16,
      },
    },
  },
  plugins: [],
};
