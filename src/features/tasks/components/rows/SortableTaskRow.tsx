import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskElement } from '@/types';
import { TaskRow } from './TaskRow';

interface SortableTaskRowProps {
  task: TaskElement;
  depth: number;
  onUpdate: (updates: Partial<TaskElement>) => void;
  assigneesCount: number;
  isAssignedToMe: boolean;
  onAssignMe: () => void;
  onUnassignMe: () => void;
  onOpenAssignees: () => void;
  onShare?: () => void;
  onOpenDependencies?: (taskId: string, position?: { x: number; y: number }) => void;
}

export function SortableTaskRow(props: SortableTaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td colSpan={10}>
        <div {...listeners}>
          <TaskRow {...props} />
        </div>
      </td>
    </tr>
  );
}

