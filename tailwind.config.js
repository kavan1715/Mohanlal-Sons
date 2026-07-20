/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          cream: '#F4F4F6',      // Soft cool off-white
          sand: '#E5E5E5',       // Platinum silver
          white: '#FFFFFF',      // Pure white
          charcoal: '#0A0A0B',   // Deep obsidian black
          text: '#1A1A1E',       // Dark obsidian graphite text
          muted: '#686E78',      // Cool slate-grey secondary text
          border: '#DCDDE1',     // Cool silver-grey border
          accent: '#0A0A0B',     // Deep obsidian accent
          gold: '#1E1E24',       // Slate grey metallic replacement
          bronze: '#3A3A42',     // Dark slate grey
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        soft: '0 16px 60px rgba(17, 17, 17, 0.08)',
      },
    },
  },
  plugins: [],
}
