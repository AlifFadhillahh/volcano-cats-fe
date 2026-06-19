/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        obsidian:  "#0D0D0F",
        "obsidian-2": "#141418",
        "obsidian-3": "#1C1C24",
        lava:      "#FF5C1A",
        "lava-dim": "#CC3D00",
        gold:      "#FFB547",
        "gold-dim": "#CC8A1A",
        ember:     "#C0392B",
        ash:       "#8A8A99",
        "ash-light": "#BDBDCC",
        cream:     "#F0EAD6",
        "card-bg": "#1E1E2E",
        "card-border": "#2E2E44",
        // Gang colors
        "gang-fire":   "#FF5C1A",
        "gang-ice":    "#5CE0FF",
        "gang-storm":  "#B05CFF",
        "gang-earth":  "#5CFF8A",
        "gang-shadow": "#8A5CFF",
      },
      fontFamily: {
        display: ["Righteous", "sans-serif"],
        body:    ["Inter", "sans-serif"],
      },
      boxShadow: {
        "lava-glow":   "0 0 20px rgba(255, 92, 26, 0.6), 0 0 60px rgba(255, 92, 26, 0.2)",
        "gold-glow":   "0 0 20px rgba(255, 181, 71, 0.5)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(255,92,26,0.15)",
        "card-normal": "0 4px 12px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "lava-gradient": "linear-gradient(135deg, #FF5C1A 0%, #C0392B 100%)",
        "gold-gradient": "linear-gradient(135deg, #FFB547 0%, #FF8C00 100%)",
        "card-gradient": "linear-gradient(145deg, #1E1E2E 0%, #14141C 100%)",
        "table-felt":    "radial-gradient(ellipse at center, #1A1A2E 0%, #0D0D0F 70%)",
      },
      animation: {
        "card-flip":    "cardFlip 0.4s ease-in-out",
        "card-deal":    "cardDeal 0.3s ease-out",
        "lava-pulse":   "lavaPulse 1.5s ease-in-out infinite",
        "shake":        "shake 0.5s ease-in-out",
        "float-up":     "floatUp 0.6s ease-out forwards",
        "ember-fall":   "emberFall 2s ease-in infinite",
        "glow-pulse":   "glowPulse 2s ease-in-out infinite",
        "slide-up":     "slideUp 0.3s ease-out",
        "bounce-in":    "bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "death-flash":  "deathFlash 0.8s ease-out",
      },
      keyframes: {
        cardFlip: {
          "0%":   { transform: "rotateY(0deg)" },
          "50%":  { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        cardDeal: {
          "0%":   { transform: "translateY(-40px) scale(0.8)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)",       opacity: "1" },
        },
        lavaPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,92,26,0.4)" },
          "50%":      { boxShadow: "0 0 40px rgba(255,92,26,0.9), 0 0 80px rgba(255,92,26,0.3)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%":  { transform: "translateX(-8px) rotate(-1deg)" },
          "20%":  { transform: "translateX(8px)  rotate(1deg)" },
          "30%":  { transform: "translateX(-6px)" },
          "40%":  { transform: "translateX(6px)" },
          "50%":  { transform: "translateX(-4px)" },
          "60%":  { transform: "translateX(4px)" },
          "70%":  { transform: "translateX(-2px)" },
          "80%":  { transform: "translateX(2px)" },
        },
        floatUp: {
          "0%":   { transform: "translateY(0)",    opacity: "1" },
          "100%": { transform: "translateY(-80px)", opacity: "0" },
        },
        emberFall: {
          "0%":   { transform: "translateY(-10px) translateX(0)",    opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(20px)", opacity: "0" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        bounceIn: {
          "0%":   { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        deathFlash: {
          "0%":   { backgroundColor: "transparent" },
          "20%":  { backgroundColor: "rgba(192,57,43,0.6)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
