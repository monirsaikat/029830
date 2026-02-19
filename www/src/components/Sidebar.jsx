import {
  ActionIcon,
  Avatar,
  Badge,
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
  IconLayoutSidebarLeftExpand,
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
    <Stack gap="sm" h="100%" style={{ minHeight: 0 }}>
      <Group justify={sidebarOpen ? "space-between" : "center"} wrap="nowrap">
        {sidebarOpen ? (
          <Group gap="xs" wrap="nowrap">
            <Avatar radius="md" color="indigo" variant="light" size="sm">
              TB
            </Avatar>
            <div>
              <Text fw={800} ff='"Plus Jakarta Sans", Inter, sans-serif' size="sm">
                Task Boards
              </Text>
              <Text size="xs" c="dimmed">
                Workspace boards
              </Text>
            </div>
          </Group>
        ) : (
          <Avatar radius="md" color="indigo" variant="light" size="sm">
            TB
          </Avatar>
        )}

        <Tooltip label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <IconLayoutSidebarLeftCollapse size={16} /> : <IconLayoutSidebarLeftExpand size={16} />}
          </ActionIcon>
        </Tooltip>
      </Group>

      <Button
        fullWidth={sidebarOpen}
        leftSection={sidebarOpen ? <IconPlus size={16} /> : null}
        variant="filled"
        color="indigo"
        radius="md"
        aria-label="Create a new board"
        onClick={() => onOpenBoardModal({ mode: "create" })}
      >
        {sidebarOpen ? "New board" : <IconPlus size={16} />}
      </Button>

      <ScrollArea offsetScrollbars type="auto" style={{ flex: 1, minHeight: 0 }}>
        <Stack gap={8}>
          {boards.map((board) => (
            <NavLink
              key={board.id}
              active={board.id === selectedBoardId}
              label={sidebarOpen ? board.name : ""}
              description={sidebarOpen ? "Board" : ""}
              onClick={() => selectBoard(board.id)}
              leftSection={
                <Avatar radius="xl" color={board.id === selectedBoardId ? "indigo" : "gray"} size={26}>
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
                  borderRadius: 14,
                  border: "1px solid var(--mantine-color-default-border)",
                  backgroundColor:
                    board.id === selectedBoardId
                      ? "var(--mantine-primary-color-light)"
                      : "var(--mantine-color-body)",
                  overflow: "hidden",
                },
                label: {
                  fontWeight: 700,
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                },
              }}
            />
          ))}
        </Stack>
      </ScrollArea>

      {sidebarOpen ? (
        <Group justify="space-between" px={4}>
          <Text size="xs" c="dimmed">
            Boards
          </Text>
          <Badge variant="light" color="indigo" radius="xl">
            {boards.length}
          </Badge>
        </Group>
      ) : (
        <Tooltip label={`${boards.length} boards`}>
          <ActionIcon variant="subtle" color="gray" mx="auto" aria-label="board count">
            <IconChevronRight size={14} />
          </ActionIcon>
        </Tooltip>
      )}
    </Stack>
  );
}

export default Sidebar;
