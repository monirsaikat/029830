import { useEffect, useState } from "react";
import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import dayjs from "dayjs";
import { isDueTodayOrLater, toInputDateValue } from "../../utils/date";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

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
    dueDate: "",
    columnId: "",
  });

  useEffect(() => {
    if (!opened) return;

    setValues({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      dueDate: toInputDateValue(task?.dueDate),
      columnId: task?.columnId ?? defaultColumnId ?? columns[0]?.id ?? "",
    });
    setErrors({
      title: "",
      dueDate: "",
      columnId: "",
    });
  }, [opened, task, defaultColumnId, columns]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {
      title: "",
      dueDate: "",
      columnId: "",
    };

    if (values.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters";
    }

    if (values.dueDate && !isDueTodayOrLater(values.dueDate)) {
      nextErrors.dueDate = "Due date must be today or later";
    }

    const resolvedColumnId = values.columnId || defaultColumnId || columns[0]?.id || "";
    if (!resolvedColumnId) nextErrors.columnId = "Please select a column";

    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.dueDate || nextErrors.columnId) return;

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
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
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Title"
            placeholder="Write a task title"
            required
            autoFocus
            value={values.title}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, title: event.currentTarget.value }))
            }
            error={errors.title}
          />

          <Textarea
            label="Description"
            placeholder="Add context, acceptance criteria, or notes"
            minRows={3}
            autosize
            value={values.description}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, description: event.currentTarget.value }))
            }
          />

          <Group grow>
            <Select
              label="Priority"
              placeholder="Pick priority"
              data={PRIORITY_OPTIONS}
              allowDeselect={false}
              value={values.priority}
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
              data={columns.map((column) => ({ value: column.id, label: column.name }))}
              allowDeselect={false}
              value={values.columnId}
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
            onChange={(event) =>
              setValues((prev) => ({ ...prev, dueDate: event.currentTarget.value }))
            }
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
