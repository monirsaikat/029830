import { useMemo, useState } from "react";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconLayoutGrid,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
  IconX,
} from "@tabler/icons-react";
import { useTaskStore } from "./store/useTaskStore";
import Sidebar from "./components/Sidebar";
import BoardView from "./components/BoardView";
import BoardModal from "./components/modals/BoardModal";
import TaskModal from "./components/modals/TaskModal";

function App() {
  const boards = useTaskStore((state) => state.boards);
  const columns = useTaskStore((state) => state.columns);
  const tasks = useTaskStore((state) => state.tasks);
  const selectedBoardId = useTaskStore((state) => state.selectedBoardId);
  const searchQuery = useTaskStore((state) => state.ui.searchQuery);
  const sidebarOpen = useTaskStore((state) => state.ui.sidebarOpen);

  const createBoard = useTaskStore((state) => state.createBoard);
  const renameBoard = useTaskStore((state) => state.renameBoard);
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);

  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  const [boardModalState, setBoardModalState] = useState({
    opened: false,
    mode: "create",
    boardId: null,
    defaultName: "",
  });

  const [taskModalState, setTaskModalState] = useState({
    opened: false,
    mode: "create",
    task: null,
    defaultColumnId: null,
  });

  const selectedBoard = boards.find((board) => board.id === selectedBoardId) ?? null;

  const boardColumns = useMemo(() => {
    if (!selectedBoardId) return [];
    return columns
      .filter((column) => column.boardId === selectedBoardId)
      .sort((a, b) => a.order - b.order);
  }, [columns, selectedBoardId]);

  const allBoardTasks = useMemo(() => {
    if (!selectedBoardId) return [];
    return tasks.filter((task) => task.boardId === selectedBoardId);
  }, [tasks, selectedBoardId]);

  const boardTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allBoardTasks;

    return allBoardTasks.filter((task) => {
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [allBoardTasks, searchQuery]);

  const doneColumn = boardColumns.find((column) => column.name.toLowerCase() === "done");
  const doneCount = doneColumn
    ? allBoardTasks.filter((task) => task.columnId === doneColumn.id).length
    : 0;

  const openTaskCreate = (columnId) => {
    setTaskModalState({
      opened: true,
      mode: "create",
      task: null,
      defaultColumnId: columnId ?? boardColumns[0]?.id ?? null,
    });
  };

  return (
    <>
      <AppShell
        header={{ height: 82 }}
        navbar={{
          width: sidebarOpen ? 300 : 88,
          breakpoint: "md",
          collapsed: {
            mobile: !mobileOpened,
            desktop: false,
          },
        }}
        padding="md"
      >
        <AppShell.Navbar
          p="md"
          style={{
            borderRight: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-body)",
          }}
        >
          <Sidebar
            onOpenBoardModal={(payload = { mode: "create" }) => {
              setBoardModalState({
                opened: true,
                mode: payload.mode,
                boardId: payload.boardId ?? null,
                defaultName: payload.defaultName ?? "",
              });
              closeMobile();
            }}
          />
        </AppShell.Navbar>

        <AppShell.Header
          px="lg"
          style={{
            borderBottom: "1px solid var(--mantine-color-default-border)",
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          <Group justify="space-between" h="100%" wrap="nowrap">
            <Group wrap="nowrap" gap="sm">
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" />

              <Stack gap={2}>
                <Group gap="xs" wrap="nowrap">
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Workspace
                  </Text>
                  <Badge variant="dot" color="teal" size="sm">
                    synced
                  </Badge>
                </Group>
                <Title order={2} ff='"Plus Jakarta Sans", Inter, sans-serif'>
                  {selectedBoard?.name ?? "No board selected"}
                </Title>
              </Stack>
            </Group>

            <Group wrap="nowrap" style={{ flex: 1, maxWidth: 760 }} visibleFrom="sm">
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="Search by title or description"
                aria-label="Search tasks"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
                rightSection={
                  searchQuery ? (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      aria-label="Clear search"
                      onClick={() => setSearchQuery("")}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : null
                }
              />

              <Button
                leftSection={<IconPlus size={16} />}
                aria-label="Create a new task"
                disabled={!selectedBoard || boardColumns.length === 0}
                onClick={() => openTaskCreate(boardColumns[0]?.id)}
              >
                New task
              </Button>

              <ActionIcon
                variant="light"
                size="lg"
                radius="xl"
                aria-label="Toggle color scheme"
                onClick={() => setColorScheme(isDark ? "light" : "dark")}
              >
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>

              <Avatar radius="xl" color="blue" variant="light">
                U
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main
          p="lg"
          style={{
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <Stack gap="md" hiddenFrom="sm">
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search tasks"
              aria-label="Search tasks"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
            <Group grow>
              <Button
                leftSection={<IconPlus size={16} />}
                disabled={!selectedBoard || boardColumns.length === 0}
                onClick={() => openTaskCreate(boardColumns[0]?.id)}
              >
                New task
              </Button>
              <Button
                variant="default"
                leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
                onClick={() => setColorScheme(isDark ? "light" : "dark")}
              >
                Theme
              </Button>
            </Group>
          </Stack>

          {boards.length === 0 ? (
            <Center h="calc(100vh - 120px)">
              <Paper p="xl" radius="xl" withBorder maw={560} w="100%" shadow="md">
                <Stack align="center" gap="sm">
                  <Title order={2} ff='"Plus Jakarta Sans", Inter, sans-serif'>
                    Create your first board
                  </Title>
                  <Text c="dimmed" ta="center">
                    Organize tasks into columns, prioritize work, and drag items across stages.
                  </Text>
                  <Button
                    size="md"
                    leftSection={<IconPlus size={16} />}
                    onClick={() =>
                      setBoardModalState({
                        opened: true,
                        mode: "create",
                        boardId: null,
                        defaultName: "",
                      })
                    }
                  >
                    New board
                  </Button>
                </Stack>
              </Paper>
            </Center>
          ) : selectedBoard && boardColumns.length > 0 ? (
            <Stack gap="md" h="100%" style={{ minHeight: 0 }} mt={{ base: "md", sm: 0 }}>
              <Paper withBorder radius="xl" p="md" shadow="xs">
                <Group justify="space-between">
                  <Group>
                    <Badge leftSection={<IconLayoutGrid size={12} />} variant="light" size="lg">
                      {boardColumns.length} columns
                    </Badge>
                    <Badge color="indigo" variant="light" size="lg">
                      {allBoardTasks.length} total tasks
                    </Badge>
                    <Badge color="teal" variant="light" size="lg">
                      {doneCount} done
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    {searchQuery.trim()
                      ? `${boardTasks.length} result${boardTasks.length === 1 ? "" : "s"}`
                      : "Drag cards between columns"}
                  </Text>
                </Group>
                {searchQuery.trim() ? (
                  <>
                    <Divider my="sm" />
                    <Text size="xs" c="dimmed">
                      Filtering is active; drag is temporarily disabled to keep order deterministic.
                    </Text>
                  </>
                ) : null}
              </Paper>

              <BoardView
                boardId={selectedBoard.id}
                columns={boardColumns}
                tasks={boardTasks}
                isFiltering={Boolean(searchQuery.trim())}
                onCreateTask={openTaskCreate}
                onEditTask={(task) => {
                  setTaskModalState({
                    opened: true,
                    mode: "edit",
                    task,
                    defaultColumnId: task.columnId,
                  });
                }}
                onDeleteTask={(task) => {
                  modals.openConfirmModal({
                    title: "Delete task",
                    centered: true,
                    children: (
                      <Text size="sm">
                        Delete <strong>{task.title}</strong>? This action cannot be undone.
                      </Text>
                    ),
                    labels: { confirm: "Delete", cancel: "Cancel" },
                    confirmProps: { color: "red" },
                    onConfirm: () => {
                      deleteTask(task.id);
                      notifications.show({
                        title: "Task deleted",
                        message: `${task.title} was removed`,
                        color: "red",
                      });
                    },
                  });
                }}
              />
            </Stack>
          ) : (
            <Center h="calc(100vh - 120px)">
              <Text c="dimmed">Select or create a board to get started.</Text>
            </Center>
          )}
        </AppShell.Main>
      </AppShell>

      <BoardModal
        opened={boardModalState.opened}
        mode={boardModalState.mode}
        defaultName={boardModalState.defaultName}
        onClose={() =>
          setBoardModalState((prev) => ({
            ...prev,
            opened: false,
          }))
        }
        onSubmit={(name) => {
          if (boardModalState.mode === "create") {
            createBoard(name);
            notifications.show({
              title: "Board created",
              message: `${name.trim()} is ready`,
              color: "blue",
            });
          } else if (boardModalState.boardId) {
            renameBoard(boardModalState.boardId, name);
            notifications.show({
              title: "Board updated",
              message: "Board name saved",
              color: "blue",
            });
          }

          setBoardModalState((prev) => ({
            ...prev,
            opened: false,
          }));
        }}
      />

      <TaskModal
        opened={taskModalState.opened}
        mode={taskModalState.mode}
        task={taskModalState.task}
        columns={boardColumns}
        defaultColumnId={taskModalState.defaultColumnId}
        onClose={() =>
          setTaskModalState((prev) => ({
            ...prev,
            opened: false,
          }))
        }
        onSubmit={(payload) => {
          if (!selectedBoard) return;

          if (taskModalState.mode === "create") {
            createTask({
              boardId: selectedBoard.id,
              columnId: payload.columnId,
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
              dueDate: payload.dueDate,
            });
            notifications.show({
              title: "Task created",
              message: payload.title,
              color: "teal",
            });
          } else if (taskModalState.task) {
            updateTask(taskModalState.task.id, payload);
            notifications.show({
              title: "Task updated",
              message: payload.title,
              color: "teal",
            });
          }

          setTaskModalState((prev) => ({
            ...prev,
            opened: false,
          }));
        }}
      />
    </>
  );
}

export default App;
