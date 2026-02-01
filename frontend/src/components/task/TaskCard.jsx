import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  User,
  ShoppingCart,
  Heart,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';
import { useDateTimeFormatter } from '@/hooks/useDateTimeFormatter';

const priorityConfig = {
  low: {
    color:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
    label: 'Low',
    dotColor: 'bg-emerald-500',
  },
  medium: {
    color:
      'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
    label: 'Medium',
    dotColor: 'bg-amber-500',
  },
  high: {
    color:
      'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-300',
    label: 'High',
    dotColor: 'bg-orange-500',
  },
  urgent: {
    color: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300',
    label: 'Urgent',
    dotColor: 'bg-rose-500',
  },
};

const statusConfig = {
  pending: {
    color: 'bg-muted/50 text-muted-foreground border-border',
    icon: Clock,
    label: 'Pending',
    badgeColor:
      'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
  },
  'in-progress': {
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: AlertCircle,
    label: 'In Progress',
    badgeColor:
      'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300',
  },
  completed: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    label: 'Completed',
    badgeColor:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
  },
  cancelled: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    label: 'Cancelled',
    badgeColor:
      'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-300',
  },
};

const categoryIcons = {
  work: Briefcase,
  personal: User,
  shopping: ShoppingCart,
  health: Heart,
  learning: BookOpen,
  other: MoreHorizontal,
};

export default function TaskCard({
  task,
  index,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { formatDate } = useDateTimeFormatter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const StatusIcon = statusConfig[task.status]?.icon || Clock;
  const CategoryIcon = categoryIcons[task.category] || MoreHorizontal;

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== 'completed';
  const progressPercentage = task.progression || 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: -100 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          type: 'spring',
          stiffness: 300,
          damping: 24,
        }}
        layout
        className='group'
        whileHover={{
          y: -4,
          scale: 1.02,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
          },
        }}
      >
        <Card
          className={`
            relative overflow-hidden transition-all duration-300
            border-border/60 bg-card/70 shadow-sm hover:shadow-md rounded-3xl
            ${task.status === 'completed' ? 'bg-muted/30' : ''}
            ${
              isOverdue
                ? 'border-rose-300/60 bg-rose-50/40 dark:border-rose-500/40 dark:bg-rose-950/20'
                : ''
            }
            cursor-pointer
          `}
        >
          {/* Priority stripe */}
          <div
            className={`
            absolute top-0 left-0 w-1 h-full
            ${priorityConfig[task.priority]?.dotColor || 'bg-muted'}
          `}
          />

          <div className='p-4'>
            {/* Enhanced Header */}
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-start gap-3 flex-1'>
                {/* Priority indicator */}
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border-2
                    ${
                      priorityConfig[task.priority]?.color ||
                      'bg-muted text-muted-foreground border-muted'
                    }
                  `}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      priorityConfig[task.priority]?.dotColor || 'bg-muted'
                    }`}
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  {/* Status and Priority */}
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge
                      variant='outline'
                      className={`
                        text-xs border flex items-center gap-1
                        ${
                          statusConfig[task.status]?.badgeColor ||
                          'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      <StatusIcon className='w-3 h-3' />
                      {statusConfig[task.status]?.label || task.status}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={`
                        text-xs border
                        ${
                          priorityConfig[task.priority]?.color ||
                          'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {priorityConfig[task.priority]?.label || task.priority}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3
                    className={`
                      font-semibold text-lg leading-tight mb-2
                      ${
                        task.status === 'completed'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }
                    `}
                  >
                    {task.title}
                  </h3>
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='opacity-60 hover:opacity-100 transition-opacity'
                  >
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 shrink-0'
                    >
                      <MoreVertical className='w-4 h-4' />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className='w-4 h-4 mr-2' />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {task.status !== 'completed' && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task, 'completed')}
                    >
                      <CheckCircle2 className='w-4 h-4 mr-2' />
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  {task.status !== 'in-progress' && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task, 'in-progress')}
                    >
                      <AlertCircle className='w-4 h-4 mr-2' />
                      Mark In Progress
                    </DropdownMenuItem>
                  )}
                  {task.status !== 'pending' && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task, 'pending')}
                    >
                      <Clock className='w-4 h-4 mr-2' />
                      Mark Pending
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setTaskToDelete(task);
                      setDeleteDialogOpen(true);
                    }}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {task.description && (
              <p className='text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed'>
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className='flex flex-wrap gap-1.5 mb-4'>
                {task.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted transition-colors'
                  >
                    #{tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge
                    variant='secondary'
                    className='text-xs px-2 py-0.5 bg-muted/30'
                  >
                    +{task.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Progress Section */}
            {(progressPercentage > 0 ||
              (task.estimatedHours && task.estimatedHours > 0)) && (
              <div className='mb-4 p-3 bg-muted/30 rounded-lg'>
                {/* Progress Bar */}
                {progressPercentage > 0 && (
                  <div className='mb-3'>
                    <div className='flex items-center justify-between text-xs mb-2'>
                      <span className='text-muted-foreground font-medium'>
                        Progress
                      </span>
                      <span className='text-primary font-semibold'>
                        {progressPercentage}%
                      </span>
                    </div>
                    <motion.div
                      className='overflow-hidden rounded-full bg-background h-2 border'
                      whileHover={{ scale: 1.01 }}
                    >
                      <motion.div
                        className='h-full bg-gradient-to-r from-primary to-primary/80 rounded-full'
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </motion.div>
                  </div>
                )}

                {/* Time Tracking */}
                {(task.estimatedHours > 0 || task.actualHours > 0) && (
                  <div className='flex items-center justify-between text-xs'>
                    {task.estimatedHours > 0 && (
                      <div className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        <span className='text-muted-foreground'>Est:</span>
                        <span className='font-medium'>
                          {task.estimatedHours}h
                        </span>
                      </div>
                    )}
                    {task.actualHours > 0 && (
                      <div className='flex items-center gap-1'>
                        <CheckCircle2 className='w-3 h-3' />
                        <span className='text-muted-foreground'>Actual:</span>
                        <span className='font-medium'>{task.actualHours}h</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Footer */}
            <div className='space-y-3'>
              {/* Category and Subtasks */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {task.category && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className='flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-primary/10 text-primary border border-primary/20'
                          style={{
                            backgroundColor: task.category.color
                              ? `${task.category.color}20`
                              : undefined,
                            borderColor: task.category.color
                              ? `${task.category.color}40`
                              : undefined,
                            color: task.category.color || undefined,
                          }}
                        >
                          <CategoryIcon className='w-3 h-3' />
                          <span className='font-medium capitalize'>
                            {typeof task.category === 'string'
                              ? task.category
                              : task.category.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Category:{' '}
                        {typeof task.category === 'string'
                          ? task.category
                          : task.category.name}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs'>
                        <CheckCircle2 className='w-3 h-3 text-primary' />
                        <span className='font-medium'>
                          {task.subtasks.filter((st) => st.isCompleted).length}/
                          {task.subtasks.length}
                        </span>
                        <span className='text-muted-foreground'>subtasks</span>
                      </div>
                      <div className='w-24 h-1.5 bg-muted rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary transition-all duration-300'
                          style={{
                            width: `${
                              (task.subtasks.filter((st) => st.isCompleted)
                                .length /
                                task.subtasks.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className='flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50'>
                <div className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  <span>
                    Created {formatDate(task.createdAt)}
                  </span>
                </div>

                {task.deadline && (
                  <div
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-md
                      ${
                        isOverdue
                          ? 'text-red-600 bg-red-50 border border-red-200 font-medium'
                          : 'text-amber-600 bg-amber-50 border border-amber-200'
                      }
                    `}
                  >
                    <Calendar className='w-3 h-3' />
                    <span>Due {formatDate(task.deadline) || 'No deadline'}</span>
                    {isOverdue && (
                      <span className='text-red-600 font-semibold'>
                        • OVERDUE
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? Here are the task
              details:
              <div className='mt-3 p-3 bg-muted/50 rounded-md space-y-2'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Title:</span>
                  <span>{taskToDelete?.title}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Description:</span>
                  <span className='text-right'>
                    {taskToDelete?.description || 'No description'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Status:</span>
                  <span>
                    {taskToDelete?.status === 'completed'
                      ? 'Completed'
                      : 'Not Completed'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Priority:</span>
                  <span>
                    {priorityConfig[taskToDelete?.priority]?.label ||
                      taskToDelete?.priority}
                  </span>
                </div>
                {taskToDelete?.category && (
                  <div className='flex justify-between'>
                    <span className='font-medium'>Category:</span>
                    <span className='capitalize'>
                      {typeof taskToDelete.category === 'string'
                        ? taskToDelete.category
                        : taskToDelete.category.name}
                    </span>
                  </div>
                )}
                {taskToDelete?.deadline && (
                  <div className='flex justify-between'>
                    <span className='font-medium'>Deadline:</span>
                    <span>
                      {formatDate(taskToDelete.deadline) || 'No deadline'}
                    </span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(taskToDelete._id);
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
