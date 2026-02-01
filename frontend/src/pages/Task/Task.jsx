import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskStatsQuery,
} from '@/lib/slices/taskSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  Loader2,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Table as TableIcon,
  LayoutGrid,
  Search,
} from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { StatsCard, TaskForm, TaskCard, EmptyState } from '@/components/task';
import { FadeInList } from '@/components/animations';
import { addDays, isWithinInterval } from 'date-fns';
import { useDateTimeFormatter } from '@/hooks/useDateTimeFormatter';
import { useSnackbar } from 'notistack';

export default function Task() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    // Persist view mode in localStorage
    return localStorage.getItem('taskViewMode') || 'table';
  });
  const { formatDate } = useDateTimeFormatter();
  const { enqueueSnackbar } = useSnackbar();

  const itemsPerPage = 10;

  const { data: tasksData, isLoading } = useGetTasksQuery({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    keyword: searchQuery.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  });

  const { data: taskStatsData } = useGetTaskStatsQuery();

  const tasks = useMemo(() => tasksData?.tasks || [], [tasksData]);

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const taskStats = useMemo(() => {
    const computeDueSoon = (list) => {
      const now = new Date();
      const soon = addDays(now, 3);
      return list.filter(
        (t) =>
          t.deadline &&
          t.status !== 'completed' &&
          isWithinInterval(new Date(t.deadline), { start: now, end: soon })
      ).length;
    };

    if (taskStatsData?.stats) {
      const stats = taskStatsData.stats;
      return {
        total: stats.totalTasks || 0,
        completed: stats.completedTasks || 0,
        inProgress: stats.inProgressTasks || 0,
        pending: stats.pendingTasks || 0,
        overdue: stats.overdueTasks || 0,
        dueSoon: computeDueSoon(tasks),
        urgent: tasks.filter(
          (t) =>
            (t.priority === 'urgent' || t.priority === 'high') &&
            t.status !== 'completed'
        ).length,
        completionRate: stats.completionRate || 0,
      };
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const overdue = tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== 'completed'
    ).length;
    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      dueSoon: computeDueSoon(tasks),
      urgent: tasks.filter(
        (t) =>
          (t.priority === 'urgent' || t.priority === 'high') &&
          t.status !== 'completed'
      ).length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, taskStatsData]);

  // ────────────────────────────────────────────────
  //  Computed: filtered + sorted + paginated tasks
  // ────────────────────────────────────────────────
  const filteredAndSortedTasks = useMemo(() => {
    const result = [...tasks];
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [tasks]);

  const paginatedTasks = filteredAndSortedTasks;

  const totalPages = tasksData?.pages || 1;
  const totalCount = tasksData?.total ?? filteredAndSortedTasks.length;
  const pageFromApi = tasksData?.page || currentPage;
  const startItem =
    paginatedTasks.length > 0 ? (pageFromApi - 1) * itemsPerPage + 1 : 0;
  const endItem =
    paginatedTasks.length > 0
      ? (pageFromApi - 1) * itemsPerPage + paginatedTasks.length
      : 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    if (!showTaskForm) {
      setFormError('');
    }
  }, [showTaskForm]);

  // ────────────────────────────────────────────────
  //  Handlers
  // ────────────────────────────────────────────────
  const handleSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask({
          taskId: editingTask._id,
          ...data,
        }).unwrap();
        enqueueSnackbar('Task updated', { variant: 'success' });
      } else {
        await createTask(data).unwrap();
        enqueueSnackbar('Task created', { variant: 'success' });
      }
      setShowTaskForm(false);
      setEditingTask(null);
      setFormError('');
    } catch (err) {
      console.error('Failed to save task:', err.message || err);
      setFormError(
        err?.data?.message ||
          err?.message ||
          'Something went wrong while saving the task.'
      );
      enqueueSnackbar(
        err?.data?.message ||
          err?.message ||
          'Something went wrong while saving the task.',
        { variant: 'error' }
      );
    }
  };

  const handleEdit = (task) => {
    setFormError('');
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;
    try {
      await deleteTask(deleteTaskId).unwrap();
      enqueueSnackbar('Task deleted', { variant: 'success' });
    } catch (err) {
      console.error('Failed to delete task:', err.message || err);
      enqueueSnackbar(
        err?.data?.message || err?.message || 'Failed to delete task.',
        { variant: 'error' }
      );
    } finally {
      setDeleteTaskId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTasks.map((id) => deleteTask(id).unwrap()));
      enqueueSnackbar('Tasks deleted', { variant: 'success' });
    } catch (err) {
      console.error('Failed to bulk delete tasks:', err.message || err);
      enqueueSnackbar(
        err?.data?.message || err?.message || 'Failed to delete selected tasks.',
        { variant: 'error' }
      );
    } finally {
      setSelectedTasks([]);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask({ taskId: task._id, status: newStatus }).unwrap();
      enqueueSnackbar('Task status updated', { variant: 'success' });
    } catch (err) {
      console.error('Failed to update task status:', err.message || err);
      enqueueSnackbar(
        err?.data?.message || err?.message || 'Failed to update task status.',
        { variant: 'error' }
      );
    }
  };

  const toggleRowExpansion = (taskId) => {
    setExpandedRows((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed:
        'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
      'in-progress':
        'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300',
      pending:
        'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
      cancelled:
        'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-300',
    };

    const icons = {
      completed: <CheckCircle2 className='h-3 w-3' />,
      'in-progress': <Clock className='h-3 w-3' />,
      pending: <AlertCircle className='h-3 w-3' />,
      cancelled: <AlertCircle className='h-3 w-3' />,
    };

    const label = status ? status.replace('-', ' ') : 'unknown';

    return (
      <Badge
        variant='outline'
        className={`${
          variants[status] || 'bg-muted text-muted-foreground border-border'
        } flex items-center gap-1`}
      >
        {icons[status]}
        <span className='capitalize'>{label}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      urgent: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300',
      high: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-300',
      medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
      low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
    };

    const label = priority ? priority.replace('-', ' ') : 'none';

    return (
      <Badge
        variant='outline'
        className={`${
          variants[priority] || 'bg-muted text-muted-foreground border-border'
        }`}
      >
        <span className='capitalize'>{label}</span>
      </Badge>
    );
  };

  const getTimingBadge = (task) => {
    if (!task?.deadline || task.status === 'completed') return null;
    const now = new Date();
    const dueDate = new Date(task.deadline);
    if (dueDate < now) {
      return (
        <Badge
          variant='outline'
          className='bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300'
        >
          Overdue
        </Badge>
      );
    }
    if (isWithinInterval(dueDate, { start: now, end: addDays(now, 3) })) {
      return (
        <Badge
          variant='outline'
          className='bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300'
        >
          Due soon
        </Badge>
      );
    }
    return null;
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskViewMode', mode);
    // Reset pagination when switching views
    setCurrentPage(1);
    // Clear expanded rows when switching to card view
    if (mode === 'card') {
      setExpandedRows([]);
    }
  };

  // Keyboard shortcut for view switching (Ctrl/Cmd + Shift + V)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        const newMode = viewMode === 'table' ? 'card' : 'table';
        handleViewModeChange(newMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  // ────────────────────────────────────────────────
  //  Early returns for loading / empty states
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          type='no-tasks'
          onCreateTask={() => {
            setEditingTask(null);
            setFormError('');
            setShowTaskForm(true);
          }}
        />
        <TaskForm
          open={showTaskForm}
          onOpenChange={(open) => {
            setShowTaskForm(open);
            if (!open) setEditingTask(null);
          }}
          task={editingTask}
          onSubmit={handleSubmit}
          errorMessage={formError}
        />
      </>
    );
  }

  const hasResults = filteredAndSortedTasks.length > 0;

  return (
    <div className='space-y-5'>
      {/* Header */}
      <header className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-semibold text-foreground'>
            My Tasks
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Organize, track, and accomplish more with clear priorities.
          </p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary' className='rounded-full px-3 py-1'>
              {taskStats.total} tasks
            </Badge>
            <Badge variant='outline' className='rounded-full px-3 py-1'>
              {taskStats.dueSoon} due soon
            </Badge>
            <Badge variant='outline' className='rounded-full px-3 py-1'>
              {taskStats.completionRate}% completion
            </Badge>
          </div>
          <Button
            className='rounded-full'
            onClick={() => {
              setEditingTask(null);
              setFormError('');
              setShowTaskForm(true);
            }}
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Task
          </Button>
        </div>
      </header>

      {/* Enhanced Stats Cards - Matching Dashboard Design */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        <StatsCard
          title='Total Tasks'
          value={taskStats.total}
          subtitle={`${taskStats.inProgress} in progress`}
          icon={ListTodo}
          variant='default'
          delay={0}
          className='h-full p-4'
        />
        <StatsCard
          title='Pending'
          value={taskStats.pending}
          subtitle='Awaiting action'
          icon={Clock}
          variant='blue'
          delay={0.1}
          className='h-full p-4'
        />
        <StatsCard
          title='In Progress'
          value={taskStats.inProgress}
          subtitle='Currently working'
          icon={AlertCircle}
          variant='purple'
          delay={0.2}
          className='h-full p-4'
        />
        <StatsCard
          title='Completed'
          value={taskStats.completed}
          subtitle={
            `${taskStats.completionRate}% completion rate`
          }
          icon={CheckCircle2}
          variant='emerald'
          delay={0.3}
          className='h-full p-4'
        />
      </div>

      {/* Filter & View Toggle Bar */}
      <Card className='border-border/60 bg-card/70 shadow-sm p-0'>
        <CardContent className='px-4 py-3'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex items-center gap-2 bg-muted/30 p-1 rounded-lg relative group'>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => handleViewModeChange('table')}
                className={
                  viewMode === 'table' ? 'shadow-sm' : 'hover:bg-background/50'
                }
                title='Table view'
              >
                <TableIcon className='h-4 w-4 mr-2' />
                Table
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => handleViewModeChange('card')}
                className={
                  viewMode === 'card' ? 'shadow-sm' : 'hover:bg-background/50'
                }
                title='Card view'
              >
                <LayoutGrid className='h-4 w-4 mr-2' />
                Cards
              </Button>
              <div className='absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-muted-foreground whitespace-nowrap'>
                <kbd className='px-1.5 py-0.5 bg-muted border rounded text-xs'>
                  Ctrl+Shift+V
                </kbd>{' '}
                to toggle
              </div>
            </div>

            <div className='flex flex-1 flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='relative flex-1 min-w-[200px]'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search tasks...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-36'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='in-progress'>In Progress</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className='w-36'>
                    <SelectValue placeholder='Priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Priority</SelectItem>
                    <SelectItem value='urgent'>Urgent</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTasks.length > 0 && (
              <Button
                variant='outline'
                className='text-red-600 border-red-200 hover:bg-red-50 dark:text-red-300 dark:border-red-500/40 dark:hover:bg-red-500/10'
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete ({selectedTasks.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode='wait'>
        {!hasResults ? (
          <motion.div
            key='empty'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <EmptyState type='no-results' />
          </motion.div>
        ) : viewMode === 'card' ? (
          <motion.div
            key='card-view'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FadeInList className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {paginatedTasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={() => setDeleteTaskId(task._id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </FadeInList>
          </motion.div>
        ) : (
          <motion.div
            key='table-view'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Card className='overflow-hidden border-border/60 bg-card/70 shadow-sm p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>
                        <Checkbox
                          checked={
                            paginatedTasks.length > 0 &&
                            paginatedTasks.every((task) =>
                              selectedTasks.includes(task._id)
                            )
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTasks(
                                paginatedTasks.map((task) => task._id)
                              );
                            } else {
                              setSelectedTasks([]);
                            }
                          }}
                          aria-label='Select all tasks'
                        />
                      </TableHead>
                      <TableHead className='w-12'></TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className='w-20'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTasks.map((task) => (
                      <React.Fragment key={task._id}>
                        <TableRow className='hover:bg-muted/60'>
                          <TableCell>
                            <Checkbox
                              checked={selectedTasks.includes(task._id)}
                              onCheckedChange={(checked) => {
                                setSelectedTasks((prev) =>
                                  checked
                                    ? [...prev, task._id]
                                    : prev.filter((id) => id !== task._id)
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={() => toggleRowExpansion(task._id)}
                            >
                              {expandedRows.includes(task._id) ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className='font-medium'>
                            <div className='flex flex-col gap-1'>
                              <span className='font-medium text-foreground'>
                                {task.title}
                              </span>
                              <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                                {(task.category?.name || task.category) && (
                                  <Badge
                                    variant='outline'
                                    className='rounded-full px-2 py-0 text-[10px]'
                                  >
                                    {task.category?.name || task.category}
                                  </Badge>
                                )}
                                {getTimingBadge(task)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(task.priority)}
                          </TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{formatDate(task.deadline) || 'No deadline'}</TableCell>
                          <TableCell>{formatDate(task.createdAt)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='w-44'>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(task)}
                                >
                                  <Edit className='mr-2 h-4 w-4' /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleRowExpansion(task._id)}
                                >
                                  <Eye className='mr-2 h-4 w-4' /> Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {task.status !== 'in-progress' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(task, 'in-progress')
                                    }
                                  >
                                    <AlertCircle className='mr-2 h-4 w-4' />{' '}
                                    Mark In Progress
                                  </DropdownMenuItem>
                                )}
                                {task.status !== 'pending' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(task, 'pending')
                                    }
                                  >
                                    <Clock className='mr-2 h-4 w-4' /> Mark
                                    Pending
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, 'completed')
                                  }
                                >
                                  <CheckCircle2 className='mr-2 h-4 w-4' />{' '}
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTaskId(task._id)}
                                >
                                  <Trash2 className='mr-2 h-4 w-4' /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>

                        {expandedRows.includes(task._id) && (
                          <TableRow>
                            <TableCell colSpan={8} className='bg-muted/20 p-0'>
                              <div className='border-t border-border/60 px-4 py-4'>
                                <div className='grid gap-4 lg:grid-cols-[1.6fr_1fr]'>
                                  <div className='space-y-3'>
                                    <div className='rounded-2xl border border-border/60 bg-background/80 p-4'>
                                      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        Summary
                                      </p>
                                      <p className='mt-2 text-sm text-foreground'>
                                        {task.description ||
                                          'No description provided yet.'}
                                      </p>
                                    </div>
                                    <div className='flex flex-wrap items-center gap-2'>
                                      {(task.category?.name ||
                                        task.category) && (
                                        <Badge
                                          variant='outline'
                                          className='rounded-full px-3 py-1'
                                        >
                                          {task.category?.name ||
                                            task.category}
                                        </Badge>
                                      )}
                                      {getTimingBadge(task)}
                                    </div>
                                  </div>

                                  <div className='grid gap-3 sm:grid-cols-2'>
                                    <div className='rounded-2xl border border-border/60 bg-background/80 p-3'>
                                      <p className='text-xs text-muted-foreground'>
                                        Priority
                                      </p>
                                      <div className='mt-1'>
                                        {getPriorityBadge(task.priority)}
                                      </div>
                                    </div>
                                    <div className='rounded-2xl border border-border/60 bg-background/80 p-3'>
                                      <p className='text-xs text-muted-foreground'>
                                        Status
                                      </p>
                                      <div className='mt-1'>
                                        {getStatusBadge(task.status)}
                                      </div>
                                    </div>
                                    <div className='rounded-2xl border border-border/60 bg-background/80 p-3'>
                                      <p className='text-xs text-muted-foreground'>
                                        Deadline
                                      </p>
                                      <p className='mt-1 text-sm font-medium text-foreground'>
                                        {formatDate(task.deadline) || 'No deadline'}
                                      </p>
                                    </div>
                                    <div className='rounded-2xl border border-border/60 bg-background/80 p-3'>
                                      <p className='text-xs text-muted-foreground'>
                                        Created
                                      </p>
                                      <p className='mt-1 text-sm font-medium text-foreground'>
                                        {formatDate(task.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className='mt-4 flex flex-wrap items-center gap-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => handleEdit(task)}
                                  >
                                    <Edit className='mr-2 h-4 w-4' />
                                    Edit task
                                  </Button>
                                  {task.status !== 'in-progress' && (
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() =>
                                        handleStatusChange(
                                          task,
                                          'in-progress'
                                        )
                                      }
                                    >
                                      <AlertCircle className='mr-2 h-4 w-4' />
                                      Start progress
                                    </Button>
                                  )}
                                  {task.status !== 'pending' && (
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() =>
                                        handleStatusChange(task, 'pending')
                                      }
                                    >
                                      <Clock className='mr-2 h-4 w-4' />
                                      Move to pending
                                    </Button>
                                  )}
                                  {task.status !== 'completed' && (
                                    <Button
                                      size='sm'
                                      onClick={() =>
                                        handleStatusChange(task, 'completed')
                                      }
                                    >
                                      <CheckCircle2 className='mr-2 h-4 w-4' />
                                      Mark complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center justify-between px-6 py-4 border-t'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {startItem || 0}–{endItem} of {totalCount}
                  </p>
                  <div className='flex gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={pageFromApi === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={
                            page === pageFromApi ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={pageFromApi === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={(open) => {
          setShowTaskForm(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSubmit={handleSubmit}
        errorMessage={formError}
      />

      <AlertDialog
        open={!!deleteTaskId}
        onOpenChange={() => setDeleteTaskId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTaskId &&
                (() => {
                  const task = tasks.find((t) => t._id === deleteTaskId);
                  return task ? (
                    <div className='space-y-2'>
                      <p>
                        <strong>Title:</strong> {task.title}
                      </p>
                      <p>
                        <strong>Description:</strong>{' '}
                        {task.description || 'No description'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {task.status === 'completed'
                          ? 'Completed'
                          : 'Not Completed'}
                      </p>
                      <p className='text-destructive'>
                        This action cannot be undone.
                      </p>
                    </div>
                  ) : (
                    'Task not found.'
                  );
                })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedTasks.length} tasks?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className='bg-destructive'
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
