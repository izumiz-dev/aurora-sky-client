/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 基本色の設定を追加
        white: '#ffffff',
        black: '#000000',
        gray: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // カスタムカラー
        primary: 'oklch(67.22% 0.257 263.13)',
        secondary: 'oklch(50.71% 0.258 275.75)',
        background: 'rgba(255, 255, 255, 0.1)',
        card: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.2)',
        indigo: {
          900: 'rgb(49 46 129)'
        },
        purple: {
          900: 'rgb(88 28 135)'
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      },
      // グラデーションの設定を更新
      backgroundImage: (theme) => ({
        'gradient-90': 'linear-gradient(90deg, var(--tw-gradient-stops))',
        'gradient-45': 'linear-gradient(45deg, var(--tw-gradient-stops))',
      }),
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
