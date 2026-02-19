import { ActionIcon, Badge, Card, Group, Menu, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconCalendarEvent,
  IconDotsVertical,
  IconEdit,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import { Draggable } from "@hello-pangea/dnd";
import { formatDueDate } from "../utils/date";

const PRIORITY_STYLES = {
  low: { color: "teal", label: "Low" },
  medium: { color: "yellow", label: "Medium" },
  high: { color: "red", label: "High" },
};

/**
 * @param {{
 * task: import("../store/useTaskStore").Task,
 * index: number,
 * isDragDisabled?: boolean,
 * onEdit: (task: import("../store/useTaskStore").Task) => void,
 * onDelete: (task: import("../store/useTaskStore").Task) => void,
 * }} props
 */
function TaskCard({ task, index, isDragDisabled = false, onEdit, onDelete }) {
  const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low;

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          padding="md"
          radius="lg"
          withBorder
          shadow={snapshot.isDragging ? "md" : "xs"}
          style={{
            transition: "box-shadow 120ms ease, border-color 120ms ease, transform 120ms ease",
            borderColor: snapshot.isDragging
              ? "var(--mantine-color-blue-4)"
              : "var(--mantine-color-gray-2)",
            backgroundColor: "var(--mantine-color-white)",
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap={6} align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                <IconGripVertical size={16} color="var(--mantine-color-gray-5)" />
                <Text fw={650} c="dark.8" lineClamp={2} style={{ flex: 1 }}>
                  {task.title}
                </Text>
              </Group>

              <Menu withinPortal position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" aria-label="Open task menu">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(task)}>
                    Edit task
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={() => onDelete(task)}
                  >
                    Delete task
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            {task.description ? (
              <Text c="dimmed" size="sm" lineClamp={3}>
                {task.description}
              </Text>
            ) : null}

            <Group justify="space-between" align="center" mt={4}>
              <Badge color={priority.color} variant="light" radius="sm">
                {priority.label}
              </Badge>

              <Tooltip label={task.dueDate ?? "No due date"} withArrow>
                <Group gap={4} c={task.dueDate ? "dark.6" : "dimmed"}>
                  <IconCalendarEvent size={14} />
                  <Text size="xs">{formatDueDate(task.dueDate)}</Text>
                </Group>
              </Tooltip>
            </Group>
          </Stack>
        </Card>
      )}
    </Draggable>
  );
}

export default TaskCard;