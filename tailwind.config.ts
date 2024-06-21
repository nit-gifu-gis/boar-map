import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        theme: '#FF9800',
        text: '#212121',
        'small-text': '#757575',
        boar: '#842929',
        trap: '#FBC02D',
        vaccine: '#0288D1',
        youton: '#30C737',
        report: '#757372',
        butanetsu: '#AB3838',
        danger: '#FF0000',
        background: '#FAFAFA',
        border: '#BDBDBD',
        disabled: '#BDBDBD',
      },
    },
    fontFamily: {
      default: [
        'Helvetica Neue',
        'Hiragino Kaku Gothic ProN',
        'Arial',
        'Yu Gothic',
        'sans-serif',
      ],
    },
  },
  plugins: [],
}
export default config
