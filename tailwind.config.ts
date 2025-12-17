/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // Make sure this is here
  ],
  theme: {
    extend: {
      colors: {
        // ✨ We define the colors here so Tailwind creates all utilities
        'perfour-blue': '#00356B',
        'perfour-lilac': '#D6C5E5',
        'perfour-lightblue': '#A8D8EA',
      },
      fontFamily: {
        sans: ["var(--font-montserrat)"],
        // mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};