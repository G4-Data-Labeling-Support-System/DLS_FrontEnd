/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Đảm bảo có dòng này để quét toàn bộ thư mục src
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#9d27f1",
                "secondary": "#d946ef",
                "background-dark": "#0f0e17",
                "surface-dark": "#1a1625",
                "header-dark": "#140e1d",
                "glass-border": "rgba(157, 39, 241, 0.3)",
                "glass-bg": "rgba(255, 255, 255, 0.03)",
            },
            // ... copy các phần boxShadow, backgroundImage từ code cũ vào đây nếu chưa có
        },
    },
    plugins: [],
}