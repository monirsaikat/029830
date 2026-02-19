import { ActionIcon, Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

/**
 * @param {{
 * column: import("../store/useTaskStore").Column,
 * tasks: import("../store/useTaskStore").Task[],
 * isFiltering?: boolean,
 * onCreateTask: (columnId: string) => void,
 * onEditTask: (task: import("../store/useTaskStore").Task) => void,
 * onDeleteTask: (task: import("../store/useTaskStore").Task) => void,
 * }} props
 */
function Column({ column, tasks, isFiltering = false, onCreateTask, onEditTask, onDeleteTask }) {
  return (
    <Paper
      p="sm"
      radius="xl"
      withBorder
      shadow="xs"
      style={{
        width: "clamp(260px, 80vw, 332px)",
        minWidth: "clamp(260px, 80vw, 332px)",
        maxWidth: "clamp(260px, 80vw, 332px)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        background: "var(--mantine-color-body)",
      }}
    >
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Stack gap={2}>
          <Text fw={800} size="sm" ff='"Plus Jakarta Sans", Inter, sans-serif'>
            {column.name}
          </Text>
          <Badge variant="light" radius="sm" color="gray">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </Badge>
        </Stack>

        <ActionIcon
          variant="light"
          color="blue"
          radius="xl"
          size="lg"
          aria-label={`Create task in ${column.name}`}
          onClick={() => onCreateTask(column.id)}
        >
          <IconPlus size={17} />
        </ActionIcon>
      </Group>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Stack
            ref={provided.innerRef}
            {...provided.droppableProps}
            gap="sm"
            style={{
              flex: 1,
              minHeight: 190,
              minWidth: 0,
              padding: 6,
              borderRadius: 14,
              border: "1px dashed transparent",
              backgroundColor: snapshot.isDraggingOver
                ? "rgba(59,130,246,0.08)"
                : "var(--mantine-color-default-hover)",
              borderColor: snapshot.isDraggingOver
                ? "rgba(59,130,246,0.5)"
                : "rgba(203,213,225,0.8)",
              transition: "background-color 140ms ease, border-color 140ms ease",
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                isDragDisabled={false}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}

            {tasks.length === 0 ? (
              <Paper
                p="md"
                radius="md"
                withBorder
                style={{
                  borderStyle: "dashed",
                  borderColor: "var(--mantine-color-gray-3)",
                  backgroundColor: "var(--mantine-color-body)",
                }}
              >
                <Text c="dimmed" size="sm" ta="center">
                  Drop tasks here or add a new one
                </Text>
              </Paper>
            ) : null}

            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </Paper>
  );
}

export default Column;
