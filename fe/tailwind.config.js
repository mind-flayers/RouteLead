/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00', // Royal Orange
        secondary: '#1A237E', // Dark Blue
        background: '#FFFFFF',
        text: '#333333',
        'text-light': '#666666',
        border: '#E0E0E0',
        error: '#FF3B30',
        success: '#34C759',
      },
    },
  },
  plugins: [],
}; 