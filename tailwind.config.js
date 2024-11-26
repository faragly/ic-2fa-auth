import spartanNgPrest from '@spartan-ng/ui-core/hlm-tailwind-preset';
import tailwindcssMotion from 'tailwindcss-motion';
import tailwindcssTypography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [spartanNgPrest],
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      backgroundImage: {
        squared: "url('/squared-bg-element.svg')",
        'squared-dark': "url('/squared-bg-element-dark.svg')",
      },
    },
  },
  plugins: [tailwindcssMotion, tailwindcssTypography],
};