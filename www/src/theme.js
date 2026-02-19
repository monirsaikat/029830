import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: "700",
  },
  primaryColor: "blue",
  defaultRadius: "md",
  components: {
    AppShell: {
      defaultProps: {
        padding: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
      },
    },
    Card: {
      styles: {
        root: {
          borderColor: "var(--mantine-color-gray-2)",
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: rem(0.2),
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          color: "var(--mantine-color-dark-8)",
          backgroundColor: "var(--mantine-color-white)",
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          color: "var(--mantine-color-dark-8)",
          backgroundColor: "var(--mantine-color-white)",
        },
      },
    },
    Select: {
      styles: {
        input: {
          color: "var(--mantine-color-dark-8)",
          backgroundColor: "var(--mantine-color-white)",
        },
      },
    },
  },
});
