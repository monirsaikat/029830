import { useEffect, useRef } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Group, Stack, Text } from "@mantine/core";
import { useTaskStore } from "../store/useTaskStore";
import Column from "./Column";

/**
 * @param {{
 * boardId: string,
 * columns: import("../store/useTaskStore").Column[],
 * tasks: import("../store/useTaskStore").Task[],
 * isFiltering?: boolean,
 * onCreateTask: (columnId: string) => void,
 * onEditTask: (task: import("../store/useTaskStore").Task) => void,
 * onDeleteTask: (task: import("../store/useTaskStore").Task) => void,
 * }} props
 */
function BoardView({
  boardId,
  columns,
  tasks,
  isFiltering = false,
  onCreateTask,
  onEditTask,
  onDeleteTask,
}) {
  const moveTask = useTaskStore((state) => state.moveTask);
  const scrollRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter((task) => task.columnId === column.id);
    return acc;
  }, {});

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = 0;
  }, [boardId]);

  return (
    <DragDropContext
      onDragEnd={(result) => {
        const { destination, source } = result;
        if (!destination) return;

        if (
          destination.droppableId === source.droppableId &&
          destination.index === source.index
        ) {
          return;
        }

        moveTask({
          boardId,
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        });
      }}
    >
      <Stack gap="sm" style={{ height: "100%", minHeight: 0 }}>
        {columns.length === 0 ? (
          <Text c="dimmed" ta="center">
            No columns available for this board.
          </Text>
        ) : (
          <div
            key={boardId}
            ref={scrollRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: 8,
            }}
          >
            <Group align="stretch" gap="md" wrap="nowrap" pb="lg" pl={2} pr="md">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id] ?? []}
                  isFiltering={isFiltering}
                  onCreateTask={onCreateTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </Group>
          </div>
        )}
      </Stack>
    </DragDropContext>
  );
}

export default BoardView;
