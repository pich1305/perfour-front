import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskElement, TaskPriority, VettelTaskStatus } from '@/types';
import { GroupRow } from './GroupRow';

interface SortableGroupRowProps {
  group: TaskElement;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<TaskElement>) => void;
  assigneesCount: number;
  isAssignedToMe: boolean;
  onAssignMe: () => void;
  onUnassignMe: () => void;
  onOpenAssignees: () => void;
  onOpenSidebar: () => void;
  onCreateGroup: () => void;
  onCreateSubgroup: () => void;
  onCreateMilestone: () => void;
  onCreateTask: () => void;
  onOpenDependencies?: (taskId: string, position?: { x: number; y: number }) => void;
}

export function SortableGroupRow(props: SortableGroupRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td colSpan={10}>
        <div {...listeners}>
          <GroupRow {...props} />
        </div>
      </td>
    </tr>
  );
}

