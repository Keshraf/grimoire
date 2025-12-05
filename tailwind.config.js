/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--color-text)",
            a: {
              color: "var(--color-accent)",
              textDecoration: "underline",
              "&:hover": {
                color: "var(--color-primary)",
              },
            },
            "h1, h2, h3, h4, h5, h6": {
              color: "var(--color-text)",
              fontWeight: "600",
            },
            strong: {
              color: "var(--color-text)",
            },
            code: {
              color: "var(--color-accent)",
              backgroundColor: "var(--color-surface)",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            },
            blockquote: {
              borderLeftColor: "var(--color-accent)",
              color: "var(--color-text-muted)",
            },
            hr: {
              borderColor: "var(--color-surface)",
            },
            "ul > li::marker": {
              color: "var(--color-text-muted)",
            },
            "ol > li::marker": {
              color: "var(--color-text-muted)",
            },
            table: {
              width: "100%",
              borderCollapse: "collapse",
            },
            "thead th": {
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              fontWeight: "600",
              padding: "0.5rem 0.75rem",
              borderBottom: "2px solid var(--color-text-muted)",
            },
            "tbody td": {
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid var(--color-surface)",
            },
            "tbody tr": {
              borderBottom: "1px solid var(--color-surface)",
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "var(--color-text)",
            "--tw-prose-headings": "var(--color-text)",
            "--tw-prose-links": "var(--color-accent)",
            "--tw-prose-bold": "var(--color-text)",
            "--tw-prose-counters": "var(--color-text-muted)",
            "--tw-prose-bullets": "var(--color-text-muted)",
            "--tw-prose-hr": "var(--color-surface)",
            "--tw-prose-quotes": "var(--color-text-muted)",
            "--tw-prose-quote-borders": "var(--color-accent)",
            "--tw-prose-captions": "var(--color-text-muted)",
            "--tw-prose-code": "var(--color-accent)",
            "--tw-prose-pre-code": "var(--color-text)",
            "--tw-prose-pre-bg": "var(--color-surface)",
            "--tw-prose-th-borders": "var(--color-surface)",
            "--tw-prose-td-borders": "var(--color-surface)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
