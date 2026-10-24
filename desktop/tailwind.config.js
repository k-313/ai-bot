/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          dark: "#060814",
          card: "#0d1127",
          border: "#1e264d",
          accent: "#3b82f6",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          neon: "#00f0ff",
          text: "#f1f5f9",
          muted: "#94a3b8"
        }
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.25)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.35)',
      }
    },
  },
  plugins: [],
}
