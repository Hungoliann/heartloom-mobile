/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        amber: {
          warm: "#F5EDD6",
          butter: "#F5DEAA",
          DEFAULT: "#D4A853",
          deep: "#B8863C",
        },
        sage: {
          light: "#C8D5B9",
          DEFAULT: "#8BAE72",
          deep: "#5C7A45",
        },
        loom: {
          bg: "#FAF6EE",
          cream: "#FAF3E2",
          text: "#2C1F0E",
          muted: "#8C7B65",
        },
        terracotta: {
          light: "#E8A07A",
          DEFAULT: "#B86241",
          deep: "#8B3A1E",
        },
        honey: "#EAB565",
        forest: {
          light: "#3D6040",
          DEFAULT: "#2D4530",
          deep: "#1E2E1F",
        },
        teal: {
          light: "#3D6A84",
          DEFAULT: "#2B4D61",
          deep: "#1A3044",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
