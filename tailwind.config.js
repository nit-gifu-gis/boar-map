module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        'rd': '50px'
      },
      minWidth: {
        'sel': '150px'
      },
      maxWidth: {
        'sel': '240px',
        'window': '400px',
        '17/20': '85%'
      },
      width: {
        'sel': '45%'
      },
      height: {
        'menu': '40px',
      },
      padding: {
        'full': '100%'
      },
      lineHeight: {
        '6/5': '120%',
        'double': '200%'
      },
      spacing: {
        '4.5': '18px',
        '6.5': '26px',
        'header': '60px',
        'footer': '70px',
        '9/10': '90%',
        '3/4vw': '75vw',
        '3vw': '3vw'
      },
      fontSize: {
        '14pt': '14pt'
      }
    },
    colors: {
      'primary': '#ff9800',
      'small-text': '#757575',
      'text': '#212121',
      'accent': '#536dfe',
      'excel': '#217346',
      'boar': '#842929',
      'trap': '#fbc02d',
      'vaccine': '#0288d1',
      'youton': '#30c737',
      'report': '#757372',
      'butanetsu': '#ab3838',
      'danger': '#ff0000',
      'background': '#fafafa',
      'border': '#bdbdbd',
      'disabled': '#bdbdbd',
      'input-bg': '#ffffff',
      'input-error-bg': '#ffcccc',
      'index-trace': '#ece9c8',
      'index-map': '#daecc8'
    },
    fontFamily: {
      default: ["Helvetica Neue", "Hiragino Kaku Gothic ProN", "Arial", "Yu Gothic", "sans-serif"]
    }
  },
  plugins: [],
};