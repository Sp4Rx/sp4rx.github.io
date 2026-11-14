import type { Config } from "tailwindcss";

export default {
	// Touch screens keep :hover stuck after a tap, which made an unticked row look ticked.
	future: { hoverOnlyWhenSupported: true },
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: 'hsl(var(--foreground))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				card: 'hsl(var(--card))',
			},
			fontFamily: {
				sans: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
				display: ['"Big Shoulders Display"', '"Arial Narrow"', 'Impact', 'sans-serif'],
				hand: ['Caveat', '"Comic Sans MS"', 'cursive'],
				mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
			},
		}
	},
} satisfies Config;
