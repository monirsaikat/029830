import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { loadPersistedState, savePersistedState } from "../utils/storage";

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];

/** @typedef {"low" | "medium" | "high"} Priority */

/**
 * @typedef Board
 * @property {string} id
 * @property {string} name
 * @property {string} createdAt
 */

/**
 * @typedef Column
 * @property {string} id
 * @property {string} boardId
 * @property {string} name
 * @property {number} order
 */

/**
 * @typedef Task
 * @property {string} id
 * @property {string} boardId
 * @property {string} columnId
 * @property {string} title
 * @property {string} description
 * @property {Priority} priority
 * @property {string | null} dueDate
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef TaskStoreState
 * @property {Board[]} boards
 * @property {Column[]} columns
 * @property {Task[]} tasks
 * @property {string | null} selectedBoardId
 * @property {{sidebarOpen: boolean, searchQuery: string}} ui
 * @property {(name: string) => string | null} createBoard
 * @property {(boardId: string, name: string) => void} renameBoard
 * @property {(boardId: string) => void} deleteBoard
 * @property {(payload: {boardId: string, columnId: string, title: string, description?: string, priority: Priority, dueDate?: string | null}) => string} createTask
 * @property {(taskId: string, payload: {title?: string, description?: string, priority?: Priority, dueDate?: string | null, columnId?: string}) => void} updateTask
 * @property {(taskId: string) => void} deleteTask
 * @property {(payload: {boardId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number}) => void} moveTask
 * @property {(payload: {boardId: string, columnId: string, sourceIndex: number, destinationIndex: number}) => void} reorderTask
 * @property {(query: string) => void} setSearchQuery
 * @property {(boardId: string | null) => void} selectBoard
 * @property {(isOpen: boolean) => void} setSidebarOpen
 */

/**
 * @param {string} boardId
 * @returns {Column[]}
 */
function createDefaultColumns(boardId) {
  return DEFAULT_COLUMNS.map((name, index) => ({
    id: uuidv4(),
    boardId,
    name,
    order: index,
  }));
}

/**
 * @param {Task[]} tasks
 * @param {string} boardId
 * @returns {Task[]}
 */
function tasksForBoard(tasks, boardId) {
  return tasks.filter((task) => task.boardId === boardId);
}

/**
 * Builds a new global task array with source/destination column updates while preserving
 * board-external task order and column-local ordering.
 * @param {Task[]} allTasks
 * @param {{boardId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number}} payload
 * @returns {Task[]}
 */
function moveTaskInCollections(allTasks, payload) {
  const { boardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = payload;

  const boardTasks = tasksForBoard(allTasks, boardId);
  const externalTasks = allTasks.filter((task) => task.boardId !== boardId);

  const sourceTasks = boardTasks.filter((task) => task.columnId === sourceColumnId);
  const destinationTasks =
    sourceColumnId === destinationColumnId
      ? sourceTasks
      : boardTasks.filter((task) => task.columnId === destinationColumnId);

  const sourceClone = [...sourceTasks];
  const [movedTask] = sourceClone.splice(sourceIndex, 1);
  if (!movedTask) return allTasks;

  const now = new Date().toISOString();

  if (sourceColumnId === destinationColumnId) {
    sourceClone.splice(destinationIndex, 0, {
      ...movedTask,
      updatedAt: now,
    });

    const untouched = boardTasks.filter((task) => task.columnId !== sourceColumnId);
    return [...externalTasks, ...untouched, ...sourceClone];
  }

  const destinationClone = [...destinationTasks];
  destinationClone.splice(destinationIndex, 0, {
    ...movedTask,
    columnId: destinationColumnId,
    updatedAt: now,
  });

  const untouched = boardTasks.filter(
    (task) => task.columnId !== sourceColumnId && task.columnId !== destinationColumnId,
  );

  return [...externalTasks, ...untouched, ...sourceClone, ...destinationClone];
}

const persisted = loadPersistedState();

const fallbackBoardId = uuidv4();

/** @type {Pick<TaskStoreState, "boards" | "columns" | "tasks" | "selectedBoardId" | "ui">} */
const initialState =
  persisted ?? {
    boards: [
      {
        id: fallbackBoardId,
        name: "Product Roadmap",
        createdAt: new Date().toISOString(),
      },
    ],
    columns: createDefaultColumns(fallbackBoardId),
    tasks: [
      {
        id: uuidv4(),
        boardId: fallbackBoardId,
        columnId: "",
        title: "Design task card interactions",
        description: "Polish hover, focus, and drag visuals for better scanability.",
        priority: "medium",
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    selectedBoardId: fallbackBoardId,
    ui: {
      sidebarOpen: true,
      searchQuery: "",
    },
  };

if (!persisted) {
  const todoColumn = initialState.columns.find((column) => column.name === "Todo");
  if (todoColumn && initialState.tasks[0]) {
    initialState.tasks[0].columnId = todoColumn.id;
  }
}

/** @type {import("zustand").UseBoundStore<import("zustand").StoreApi<TaskStoreState>>} */
export const useTaskStore = create((set, get) => ({
  ...initialState,

  createBoard: (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const boardId = uuidv4();
    const now = new Date().toISOString();

    set((state) => ({
      boards: [...state.boards, { id: boardId, name: trimmedName, createdAt: now }],
      columns: [...state.columns, ...createDefaultColumns(boardId)],
      selectedBoardId: boardId,
      ui: { ...state.ui, searchQuery: "" },
    }));

    return boardId;
  },

  renameBoard: (boardId, name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              name: trimmedName,
            }
          : board,
      ),
    }));
  },

  deleteBoard: (boardId) => {
    set((state) => {
      const boards = state.boards.filter((board) => board.id !== boardId);
      const columns = state.columns.filter((column) => column.boardId !== boardId);
      const tasks = state.tasks.filter((task) => task.boardId !== boardId);
      const selectedBoardId =
        state.selectedBoardId === boardId ? (boards[0]?.id ?? null) : state.selectedBoardId;

      return {
        boards,
        columns,
        tasks,
        selectedBoardId,
      };
    });
  },

  createTask: ({ boardId, columnId, title, description = "", priority, dueDate = null }) => {
    const now = new Date().toISOString();
    const task = {
      id: uuidv4(),
      boardId,
      columnId,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      tasks: [...state.tasks, task],
    }));

    return task.id;
  },

  updateTask: (taskId, payload) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...payload,
              title: payload.title !== undefined ? payload.title.trim() : task.title,
              description:
                payload.description !== undefined
                  ? payload.description.trim()
                  : task.description,
              dueDate: payload.dueDate === "" ? null : payload.dueDate ?? task.dueDate,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },

  moveTask: (payload) => {
    set((state) => ({
      tasks: moveTaskInCollections(state.tasks, payload),
    }));
  },

  reorderTask: ({ boardId, columnId, sourceIndex, destinationIndex }) => {
    get().moveTask({
      boardId,
      sourceColumnId: columnId,
      destinationColumnId: columnId,
      sourceIndex,
      destinationIndex,
    });
  },

  setSearchQuery: (query) => {
    set((state) => ({
      ui: {
        ...state.ui,
        searchQuery: query,
      },
    }));
  },

  selectBoard: (boardId) => {
    set((state) => ({
      selectedBoardId: boardId,
      ui: {
        ...state.ui,
        searchQuery: "",
      },
    }));
  },

  setSidebarOpen: (isOpen) => {
    set((state) => ({
      ui: {
        ...state.ui,
        sidebarOpen: isOpen,
      },
    }));
  },
}));

useTaskStore.subscribe((state) => {
  savePersistedState({
    boards: state.boards,
    columns: state.columns,
    tasks: state.tasks,
    selectedBoardId: state.selectedBoardId,
    ui: state.ui,
  });
});