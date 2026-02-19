import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconLayoutSidebarLeftCollapse,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTaskStore } from "../store/useTaskStore";

/**
 * @param {{
 * onOpenBoardModal: (payload?: { mode: "create" | "edit", boardId?: string, defaultName?: string }) => void,
 * }} props
 */
function Sidebar({ onOpenBoardModal }) {
  const boards = useTaskStore((state) => state.boards);
  const selectedBoardId = useTaskStore((state) => state.selectedBoardId);
  const selectBoard = useTaskStore((state) => state.selectBoard);
  const deleteBoard = useTaskStore((state) => state.deleteBoard);
  const sidebarOpen = useTaskStore((state) => state.ui.sidebarOpen);
  const setSidebarOpen = useTaskStore((state) => state.setSidebarOpen);

  return (
    <Stack gap="sm" h="100%">
      <Group justify={sidebarOpen ? "space-between" : "center"} wrap="nowrap">
        {sidebarOpen ? (
          <Group gap="xs">
            <Avatar radius="md" color="blue" variant="light" size="sm">
              TB
            </Avatar>
            <Text fw={700} ff='"Plus Jakarta Sans", Inter, sans-serif'>
              Task Boards
            </Text>
          </Group>
        ) : null}

        <Tooltip label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <IconLayoutSidebarLeftCollapse size={16} />
            ) : (
              <IconChevronRight size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>

      <Button
        fullWidth={sidebarOpen}
        leftSection={sidebarOpen ? <IconPlus size={16} /> : null}
        variant="filled"
        color="blue"
        aria-label="Create a new board"
        onClick={() => onOpenBoardModal({ mode: "create" })}
      >
        {sidebarOpen ? "New board" : <IconPlus size={16} />}
      </Button>

      <ScrollArea offsetScrollbars type="auto" style={{ flex: 1 }}>
        <Stack gap={6}>
          {boards.map((board) => (
            <NavLink
              key={board.id}
              active={board.id === selectedBoardId}
              label={sidebarOpen ? board.name : ""}
              description={sidebarOpen ? "Board" : ""}
              onClick={() => selectBoard(board.id)}
              leftSection={
                <Avatar radius="xl" color={board.id === selectedBoardId ? "blue" : "gray"} size={26}>
                  {board.name.slice(0, 1).toUpperCase()}
                </Avatar>
              }
              rightSection={
                sidebarOpen ? (
                  <Menu withinPortal position="right-start">
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label={`Open actions for ${board.name}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <IconDotsVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenBoardModal({
                            mode: "edit",
                            boardId: board.id,
                            defaultName: board.name,
                          });
                        }}
                      >
                        Rename
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          modals.openConfirmModal({
                            title: "Delete board",
                            centered: true,
                            children: (
                              <Text size="sm">
                                Delete <strong>{board.name}</strong>? This removes all columns and tasks.
                              </Text>
                            ),
                            labels: { confirm: "Delete", cancel: "Cancel" },
                            confirmProps: { color: "red" },
                            onConfirm: () => {
                              deleteBoard(board.id);
                              notifications.show({
                                title: "Board deleted",
                                message: `${board.name} was removed`,
                                color: "red",
                              });
                            },
                          });
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                ) : null
              }
              styles={{
                root: {
                  borderRadius: 12,
                  border: "1px solid var(--mantine-color-gray-2)",
                  backgroundColor:
                    board.id === selectedBoardId
                      ? "var(--mantine-color-blue-0)"
                      : "var(--mantine-color-white)",
                },
                label: {
                  fontWeight: 700,
                  lineHeight: 1.25,
                },
              }}
            />
          ))}
        </Stack>
      </ScrollArea>

      {sidebarOpen ? (
        <Text size="xs" c="dimmed" ta="center">
          {boards.length} board{boards.length === 1 ? "" : "s"}
        </Text>
      ) : null}
    </Stack>
  );
}

export default Sidebar;