/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                minimal: {
                    border: '#e2e8f0',
                    bg: '#ffffff',
                    surface: '#f8fafc',
                    muted: '#64748b',
                    text: '#0f172a',
                },
                accent: {
                    blue: '#3b82f6',
                    teal: '#0d9488',
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'minimal-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                'minimal-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
