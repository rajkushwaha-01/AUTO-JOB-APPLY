/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yc: {
          orange: '#F26522',
          'orange-hover': '#FF6B35',
          'orange-light': '#FFF7ED',
          bg: '#FFFFFF',
          'bg-secondary': '#F7F7F5',
          'bg-subtle': '#FAFAFA',
          text: '#171717',
          'text-secondary': '#737373',
          'text-muted': '#A3A3A3',
          border: '#E5E5E5',
          'border-subtle': '#F0F0F0',
          success: '#16A34A',
          'success-bg': '#DCFCE7',
          'success-border': '#BBF7D0',
          warning: '#D97706',
          'warning-bg': '#FEF3C7',
          'warning-border': '#FDE68A',
          error: '#DC2626',
          'error-bg': '#FEE2E2',
          'error-border': '#FECACA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
    },
  },
  plugins: [],
}

