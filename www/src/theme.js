import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: "700",
  },
  primaryColor: "indigo",
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
          borderColor: "var(--mantine-color-default-border)",
          backgroundColor: "var(--mantine-color-body)",
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
          backgroundColor: "var(--mantine-color-body)",
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-body)",
        },
      },
    },
    Select: {
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-body)",
        },
      },
    },
  },
});
