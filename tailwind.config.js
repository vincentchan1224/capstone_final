/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        7: "7px",
        4: "4px",
      },
      ringWidth: {
        4: "4px",
      },
      colors: {
        "yellow-400": "#FBBF24",
        "purple-500": "#8B5CF6",
        "blue-500": "#3B82F6",
        "green-500": "#10B981",
        "gray-800": "#1F2937",
      },
      backgroundImage: {
        "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
