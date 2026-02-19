import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <Container size="sm" py={40}>
      <Stack gap="md">
        <Title order={2}>Mantine Setup Check</Title>
        <Text c="dimmed">
          If you can see this styled card, inputs, badge, and progress, Mantine
          is working.
        </Text>

        <Card withBorder radius="md" shadow="sm" padding="lg">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600}>Demo Controls</Text>
              <Badge color="teal" variant="light">
                Ready
              </Badge>
            </Group>

            <TextInput
              label="Your name"
              placeholder="Type your name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />

            <Group>
              <Button
                onClick={() => {
                  const next = count + 1;
                  setCount(next);
                  notifications.show({
                    title: "Counter updated",
                    message: `Count is now ${next}`,
                    color: "blue",
                  });
                }}
              >
                Increment
              </Button>

              <Text>Count: {count}</Text>
            </Group>

            <Progress value={(count % 10) * 10} animated />
            <Text size="sm" c="dimmed">
              Hello {name || "there"}.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export default App;
