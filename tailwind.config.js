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
        'window': '400px'
      },
      width: {
        'sel': '45%'
      },
      padding: {
        'full': '100%'
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