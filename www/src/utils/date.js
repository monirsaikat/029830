import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * @param {string | null | undefined} dueDate
 * @returns {string}
 */
export function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";

  const date = dayjs(dueDate);
  if (!date.isValid()) return "No due date";

  const today = dayjs().startOf("day");
  const dueDay = date.startOf("day");

  if (dueDay.isBefore(today)) {
    return `Overdue ${dueDay.from(today)}`;
  }

  if (dueDay.isSame(today)) {
    return "Due today";
  }

  return `Due ${today.to(dueDay)}`;
}

/**
 * @param {string | null | undefined} dueDate
 * @returns {boolean}
 */
export function isDueTodayOrLater(dueDate) {
  if (!dueDate) return true;

  const due = dayjs(dueDate).startOf("day");
  if (!due.isValid()) return false;

  return due.isSame(dayjs().startOf("day")) || due.isAfter(dayjs().startOf("day"));
}

/**
 * @param {Date | string | null | undefined} value
 * @returns {string}
 */
export function toInputDateValue(value) {
  if (!value) return "";

  const date = dayjs(value);
  if (!date.isValid()) return "";

  return date.format("YYYY-MM-DD");
}