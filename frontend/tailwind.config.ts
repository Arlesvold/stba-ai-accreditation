import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			sans: ["Inter", "system-ui", "sans-serif"],
		},
		fontSize: {
			hero: ["1.25rem", { lineHeight: "1.2", fontWeight: "600" }],
			section: ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
			cardtitle: ["0.9375rem", { lineHeight: "1.4", fontWeight: "600" }],
			body13: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
			label11: ["0.6875rem", { lineHeight: "1.4", fontWeight: "500" }],
		},
  		colors: {
			sidebar: '#0F172A',
			surface: '#FFFFFF',
			page: '#F8FAFC',
			brand: {
				primary: "var(--color-primary)",
				accent: "var(--color-primary)",
				surface: "var(--color-surface)",
				page: "var(--color-page-bg)",
				textPrimary: "var(--color-text-primary)",
				textMuted: "var(--color-text-muted)",
				hint: "var(--color-text-hint)",
				success: "var(--color-success)",
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
			card: '10px',
			btn: '8px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
