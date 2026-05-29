/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Indigo 600
        secondary: "#10B981", // Emerald 500
        background: "#F9FAFB", // Gray 50
        surface: "#FFFFFF",
        text: {
          main: "#111827", // Gray 900
          muted: "#6B7280", // Gray 500
        }
      },
    },
  },
  plugins: [],
};
