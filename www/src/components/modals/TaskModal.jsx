import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconBold,
  IconH1,
  IconH2,
  IconItalic,
  IconList,
  IconListNumbers,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { isDueTodayOrLater, toInputDateValue } from "../../utils/date";
import { hasRichTextContent, toPlainText } from "../../utils/richText";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const FORMAT_ACTIONS = [
  { command: "bold", icon: IconBold, label: "Bold" },
  { command: "italic", icon: IconItalic, label: "Italic" },
  { command: "underline", icon: IconUnderline, label: "Underline" },
  { command: "strikeThrough", icon: IconStrikethrough, label: "Strike" },
  { command: "insertUnorderedList", icon: IconList, label: "Bulleted list" },
  { command: "insertOrderedList", icon: IconListNumbers, label: "Numbered list" },
  { command: "formatBlock:h1", icon: IconH1, label: "Heading 1" },
  { command: "formatBlock:h2", icon: IconH2, label: "Heading 2" },
];

function RichTextField({ value, onChange, error }) {
  const editorRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    if (command.startsWith("formatBlock:")) {
      const tag = command.split(":")[1];
      document.execCommand("formatBlock", false, tag);
      return;
    }

    document.execCommand(command, false);
  };

  return (
    <Stack gap={6}>
      <Text fw={500} size="sm">
        Description
      </Text>
      <Paper withBorder p="xs" radius="md" style={{ borderColor: error ? "var(--mantine-color-red-5)" : undefined }}>
        <Group gap={4} mb="xs" wrap="wrap">
          {FORMAT_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <ActionIcon
                key={action.command}
                variant="subtle"
                color="gray"
                aria-label={action.label}
                onMouseDown={(event) => {
                  event.preventDefault();
                  runCommand(action.command);
                }}
              >
                <Icon size={15} />
              </ActionIcon>
            );
          })}
        </Group>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Description"
          onInput={(event) => {
            const nextHtml = event.currentTarget.innerHTML;
            onChange(nextHtml);
          }}
          style={{
            minHeight: 110,
            outline: "none",
            fontSize: 15,
            lineHeight: 1.5,
          }}
          data-placeholder="Add context, acceptance criteria, notes, or checklist"
        />
      </Paper>
      {error ? (
        <Text c="red" size="xs">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}

/**
 * @param {{
 * opened: boolean,
 * mode: "create" | "edit",
 * task?: import("../../store/useTaskStore").Task | null,
 * columns: import("../../store/useTaskStore").Column[],
 * defaultColumnId?: string | null,
 * onClose: () => void,
 * onSubmit: (payload: { title: string, description: string, priority: "low"|"medium"|"high", dueDate: string | null, columnId: string }) => void,
 * }} props
 */
function TaskModal({
  opened,
  mode,
  task,
  columns,
  defaultColumnId,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    columnId: defaultColumnId ?? "",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    dueDate: "",
    columnId: "",
  });

  const columnOptions = useMemo(
    () => columns.map((column) => ({ value: column.id, label: column.name })),
    [columns],
  );

  useEffect(() => {
    if (!opened) return;

    const resolvedColumnId = task?.columnId ?? defaultColumnId ?? columns[0]?.id ?? "";

    setValues({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      dueDate: toInputDateValue(task?.dueDate),
      columnId: resolvedColumnId,
    });
    setErrors({
      title: "",
      description: "",
      dueDate: "",
      columnId: "",
    });
  }, [opened, task, defaultColumnId, columns]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {
      title: "",
      description: "",
      dueDate: "",
      columnId: "",
    };

    if (values.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters";
    }

    if (!hasRichTextContent(values.description)) {
      nextErrors.description = "Please add at least a short description";
    }

    if (values.dueDate && !isDueTodayOrLater(values.dueDate)) {
      nextErrors.dueDate = "Due date must be today or later";
    }

    const resolvedColumnId = values.columnId || defaultColumnId || columns[0]?.id || "";
    if (!resolvedColumnId) nextErrors.columnId = "Please select a column";

    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.description || nextErrors.dueDate || nextErrors.columnId) {
      return;
    }

    onSubmit({
      title: values.title.trim(),
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate ? dayjs(values.dueDate).format("YYYY-MM-DD") : null,
      columnId: resolvedColumnId,
    });

    setValues({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      columnId: "",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === "create" ? "Create task" : "Edit task"}
      centered
      radius="md"
      size="lg"
      withinPortal={false}
      keepMounted
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Title"
            placeholder="Write a task title"
            required
            autoFocus
            value={values.title}
            onChange={(event) => {
              const nextTitle = event.currentTarget.value;
              setValues((prev) => ({ ...prev, title: nextTitle }));
            }}
            error={errors.title}
          />

          <RichTextField
            value={values.description}
            onChange={(event) => {
              const nextDescription = event.currentTarget.value;
              setValues((prev) => ({ ...prev, description: nextDescription }));
            }}
          />

          {hasRichTextContent(values.description) ? (
            <Text size="xs" c="dimmed">
              Preview: {toPlainText(values.description).slice(0, 120)}
            </Text>
          ) : null}

          <Group grow>
            <Select
              label="Priority"
              placeholder="Pick priority"
              data={PRIORITY_OPTIONS}
              allowDeselect={false}
              value={values.priority ?? null}
              onChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  priority: next ?? "medium",
                }))
              }
            />

            <Select
              label="Column"
              placeholder="Select destination column"
              data={columnOptions}
              allowDeselect={false}
              value={values.columnId || null}
              onChange={(next) =>
                setValues((prev) => ({
                  ...prev,
                  columnId: next ?? "",
                }))
              }
              error={errors.columnId}
            />
          </Group>

          <TextInput
            type="date"
            label="Due date"
            placeholder="Pick due date"
            min={dayjs().format("YYYY-MM-DD")}
            value={values.dueDate}
            onChange={(event) => {
              const nextDueDate = event.currentTarget.value;
              setValues((prev) => ({ ...prev, dueDate: nextDueDate }));
            }}
            error={errors.dueDate}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Create task" : "Save changes"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default TaskModal;
