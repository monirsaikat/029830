import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";

/**
 * @param {{
 * opened: boolean,
 * mode: "create" | "edit",
 * defaultName?: string,
 * onClose: () => void,
 * onSubmit: (name: string) => void,
 * }} props
 */
function BoardModal({ opened, mode, defaultName = "", onClose, onSubmit }) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!opened) return;
    setName(defaultName);
    setError("");
  }, [opened, defaultName]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (name.trim().length < 3) {
      setError("Board name must be at least 3 characters");
      return;
    }

    onSubmit(name);
    setName("");
    setError("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === "create" ? "Create board" : "Rename board"}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Board name"
            placeholder="Ex: Product Sprint"
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
              if (error) setError("");
            }}
            error={error}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Create" : "Save"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default BoardModal;
