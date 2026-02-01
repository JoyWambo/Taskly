'use client';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useGetTasksQuery, useGetTaskStatsQuery } from '@/lib/slices/taskSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Clock,
  ListTodo,
  Activity,
  Sparkles,
  User,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';

import { StatsCard } from '@/components/task';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Import format utilities for better date handling
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  addDays,
  isWithinInterval,
} from 'date-fns';
import { useDateTimeFormatter } from '@/hooks/useDateTimeFormatter';

// Get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    color: '#dc2626',
  },
  high: {
    label: 'High',
    color: '#ef4444',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
  },
  low: {
    label: 'Low',
    color: '#10b981',
  },
};

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const greeting = getTimeBasedGreeting();
  const { formatDate } = useDateTimeFormatter();

  // Fetch real data from API
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery({
    pageSize: 100, // Get all tasks for analytics
  });
  const { data: statsData, isLoading: statsLoading } = useGetTaskStatsQuery(); // eslint-disable-line no-unused-vars

  const tasks = useMemo(() => tasksData?.tasks || [], [tasksData]);
  const apiStats = statsData || {}; // eslint-disable-line no-unused-vars

  const chartConfig = {
    completed: {
      label: 'Completed',
      color: '#10b981',
    },
    created: {
      label: 'Created',
      color: '#3b82f6',
    },
    inProgress: {
      label: 'In Progress',
      color: '#f59e0b',
    },
  };

  // Generate chart data from real tasks
  const { weeklyData, weeklySummary, priorityData, stats } = useMemo(() => {
    if (!tasks.length) {
      return {
        weeklyData: [],
        weeklySummary: {
          created: 0,
          completed: 0,
          inProgress: 0,
        },
        priorityData: [],
        stats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          cancelled: 0,
          overdue: 0,
          dueSoon: 0,
          urgent: 0,
          completionRate: 0,
        },
      };
    }

    // Calculate basic stats
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const cancelled = tasks.filter((t) => t.status === 'cancelled').length;
    const overdue = tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== 'completed'
    ).length;
    const now = new Date();
    const soon = addDays(now, 3);
    const dueSoon = tasks.filter(
      (t) =>
        t.deadline &&
        t.status !== 'completed' &&
        isWithinInterval(new Date(t.deadline), { start: now, end: soon })
    ).length;
    const urgent = tasks.filter(
      (t) =>
        (t.priority === 'urgent' || t.priority === 'high') &&
        t.status !== 'completed'
    ).length;

    // Weekly data for the last 7 days
    const weekDays = eachDayOfInterval({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    });

    const weeklyData = weekDays.map((day) => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));

      const dayTasks = tasks.filter((task) => {
        const createdAt = new Date(task.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });

      const completedToday = tasks.filter((task) => {
        const completedAt = task.completedAt
          ? new Date(task.completedAt)
          : null;
        return completedAt && completedAt >= dayStart && completedAt <= dayEnd;
      });

      return {
        day: format(day, 'EEE'),
        created: dayTasks.length,
        completed: completedToday.length,
        inProgress: dayTasks.filter((t) => t.status === 'in-progress').length,
      };
    });

    const weeklySummary = weeklyData.reduce(
      (summary, day) => ({
        created: summary.created + day.created,
        completed: summary.completed + day.completed,
        inProgress: summary.inProgress + day.inProgress,
      }),
      { created: 0, completed: 0, inProgress: 0 }
    );

    // Priority distribution
    const priorityCounts = {
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    };

    const priorityData = [
      {
        key: 'urgent',
        name: priorityConfig.urgent.label,
        value: priorityCounts.urgent,
        color: priorityConfig.urgent.color,
      },
      {
        key: 'high',
        name: priorityConfig.high.label,
        value: priorityCounts.high,
        color: priorityConfig.high.color,
      },
      {
        key: 'medium',
        name: priorityConfig.medium.label,
        value: priorityCounts.medium,
        color: priorityConfig.medium.color,
      },
      {
        key: 'low',
        name: priorityConfig.low.label,
        value: priorityCounts.low,
        color: priorityConfig.low.color,
      },
    ].filter((item) => item.value > 0); // Only show priorities that have tasks

    const stats = {
      total,
      completed,
      inProgress,
      pending,
      cancelled,
      overdue,
      dueSoon,
      urgent,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };

    return { weeklyData, weeklySummary, priorityData, stats };
  }, [tasks]);

  const priorityTotal = useMemo(
    () => priorityData.reduce((sum, item) => sum + item.value, 0),
    [priorityData]
  );

  const focusTasks = useMemo(() => {
    const activeTasks = tasks.filter(
      (task) => task.status !== 'completed' && task.status !== 'cancelled'
    );
    const sorted = [...activeTasks].sort((a, b) => {
      const aDate = a.deadline
        ? new Date(a.deadline)
        : new Date(a.createdAt || Date.now());
      const bDate = b.deadline
        ? new Date(b.deadline)
        : new Date(b.createdAt || Date.now());
      return aDate - bDate;
    });
    return sorted.slice(0, 3);
  }, [tasks]);

  const categoryOverview = useMemo(() => {
    const summary = {};

    tasks.forEach((task) => {
      const categoryLabel =
        typeof task.category === 'string'
          ? task.category
          : task.category?.name || 'Uncategorized';
      if (!summary[categoryLabel]) {
        summary[categoryLabel] = { total: 0, completed: 0 };
      }
      summary[categoryLabel].total += 1;
      if (task.status === 'completed') {
        summary[categoryLabel].completed += 1;
      }
    });

    return Object.entries(summary)
      .map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        completionRate:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300';
      case 'in-progress':
        return 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300';
      case 'pending':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300';
      case 'cancelled':
        return 'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-300';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300';
      case 'high':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-300';
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className='space-y-5'>
      {/* Welcome Section */}
      <header className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <Sparkles className='h-5 w-5 text-primary' />
            <span className='text-sm font-medium text-primary/80'>
              {greeting}
            </span>
          </div>
          <h1 className='text-2xl md:text-3xl font-semibold text-foreground'>
            Welcome back,{' '}
            <span className='capitalize'>{userInfo?.name || 'User'}!</span>
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Here is a quick pulse check on your task momentum today.
          </p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary' className='rounded-full px-3 py-1'>
              {stats.total} total tasks
            </Badge>
            <Badge variant='outline' className='rounded-full px-3 py-1'>
              {stats.dueSoon} due soon
            </Badge>
            <Badge variant='outline' className='rounded-full px-3 py-1'>
              {stats.completionRate}% completion
            </Badge>
          </div>
        </div>
      </header>

      <div className='grid gap-5 lg:grid-cols-12 lg:items-start'>
        <div className='flex flex-col gap-5 lg:col-span-5'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card
              size='sm'
              className='relative z-10 rounded-3xl border border-border/60 bg-card/70 shadow-sm'
            >
              <CardHeader>
                <CardTitle className='text-foreground'>
                  Profile snapshot
                </CardTitle>
                <CardDescription className='text-muted-foreground'>
                  Manage your personal details and active workload.
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm'>
                    <User className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-foreground'>
                      {userInfo?.name || 'Taskly User'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {userInfo?.email || 'No email set'}
                    </p>
                  </div>
                </div>

                <div className='grid gap-2 sm:grid-cols-2'>
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Mail className='h-3.5 w-3.5' />
                      <span>Email</span>
                    </div>
                    <p className='text-sm font-semibold text-foreground'>
                      {userInfo?.email || 'N/A'}
                    </p>
                  </div>
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Phone className='h-3.5 w-3.5' />
                      <span>Phone</span>
                    </div>
                    <p className='text-sm font-semibold text-foreground'>
                      {userInfo?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                    <p className='text-xs text-muted-foreground'>
                      Active tasks
                    </p>
                    <p className='text-sm font-semibold text-foreground'>
                      {stats.inProgress + stats.pending}
                    </p>
                  </div>
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                    <p className='text-xs text-muted-foreground'>Completed</p>
                    <p className='text-sm font-semibold text-foreground'>
                      {stats.completed}
                    </p>
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <Button asChild variant='outline' size='sm'>
                    <NavLink to='/profile'>View profile</NavLink>
                  </Button>
                  <Button asChild size='sm'>
                    <NavLink to='/settings'>Edit settings</NavLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='lg:col-span-7'
        >
          <Card
            size='sm'
            className='relative z-10 rounded-3xl border border-border/60 bg-card/70 shadow-sm'
          >
            <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <CardTitle className='text-foreground'>
                  Today&apos;s focus
                </CardTitle>
                <CardDescription className='text-muted-foreground'>
                  Stay close to deadlines and keep momentum visible.
                </CardDescription>
              </div>
              <Badge variant='outline' className='rounded-full px-3 py-1'>
                {stats.urgent} high priority
              </Badge>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                  <p className='text-xs text-muted-foreground'>Due soon</p>
                  <p className='text-lg font-semibold text-foreground'>
                    {stats.dueSoon}
                  </p>
                </div>
                <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                  <p className='text-xs text-muted-foreground'>Overdue</p>
                  <p className='text-lg font-semibold text-foreground'>
                    {stats.overdue}
                  </p>
                </div>
                <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                  <p className='text-xs text-muted-foreground'>In progress</p>
                  <p className='text-lg font-semibold text-foreground'>
                    {stats.inProgress}
                  </p>
                </div>
                <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                  <p className='text-xs text-muted-foreground'>
                    Completion rate
                  </p>
                  <p className='text-lg font-semibold text-foreground'>
                    {stats.completionRate}%
                  </p>
                </div>
              </div>

              <div className='space-y-2'>
                {tasksLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className='h-14 rounded-2xl border border-border/60 bg-muted/40'
                    />
                  ))}
                {!tasksLoading && focusTasks.length === 0 && (
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-3 text-sm text-muted-foreground'>
                    All caught up. Add a new task or pick something from the
                    backlog.
                  </div>
                )}
                {!tasksLoading &&
                  focusTasks.map((task) => (
                    <div
                      key={task._id}
                      className='flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between'
                    >
                      <div>
                        <p className='text-sm font-medium text-foreground'>
                          {task.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {task.category?.name ||
                            task.category ||
                            'No category'}
                        </p>
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={getStatusColor(task.status)}
                        >
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Badge
                          variant='outline'
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          {task.deadline
                            ? formatDate(task.deadline) || 'No deadline'
                            : 'No deadline'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className='relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Tasks'
          value={stats.total}
          subtitle={`${stats.completed} completed`}
          icon={ListTodo}
          variant='default'
          delay={0}
          className='h-full p-4'
        />
        <StatsCard
          title='Pending'
          value={stats.pending}
          subtitle='Awaiting action'
          icon={Clock}
          variant='blue'
          delay={0.1}
          className='h-full p-4'
        />
        <StatsCard
          title='High Priority'
          value={stats.urgent}
          subtitle='Urgent + high'
          icon={AlertCircle}
          variant='red'
          delay={0.2}
          className='h-full p-4'
        />
        <StatsCard
          title='Productivity Score'
          value={
            stats.total > 0
              ? Math.round(
                  ((stats.completed + stats.inProgress * 0.5) / stats.total) *
                    100
                )
              : 0
          }
          subtitle='Based on task progress'
          icon={Activity}
          variant='purple'
          delay={0.3}
          className='h-full p-4'
        />
      </div>

      <div className='grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]'>
        <Card
          size='sm'
          className='relative z-10 rounded-2xl border border-border/60 bg-card/70 shadow-sm'
        >
          <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='text-foreground'>Weekly Activity</CardTitle>
              <CardDescription className='text-muted-foreground'>
                Task completion trends over the week
              </CardDescription>
            </div>
            <Badge variant='secondary' className='rounded-full px-3 py-1'>
              Last 7 days
            </Badge>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-2xl border border-border/60 bg-background/80 p-4'>
              {tasksLoading && (
                <div className='flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-sm text-muted-foreground'>
                  Loading activity trends...
                </div>
              )}
              {!tasksLoading && weeklyData.length === 0 && (
                <div className='flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-sm text-muted-foreground'>
                  Activity trends will appear as tasks are created.
                </div>
              )}
              {!tasksLoading && weeklyData.length > 0 && (
                <ChartContainer
                  config={chartConfig}
                  className='h-[220px] w-full aspect-auto'
                >
                  <BarChart
                    data={weeklyData}
                    barCategoryGap='20%'
                    margin={{ top: 10, right: 16, left: -8, bottom: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis
                      dataKey='day'
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      minTickGap={12}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      width={32}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dot' />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey='created'
                      fill='var(--color-created)'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='completed'
                      fill='var(--color-completed)'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='inProgress'
                      fill='var(--color-inProgress)'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
            <div className='grid gap-2 sm:grid-cols-3'>
              <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                <p className='text-xs text-muted-foreground'>Created</p>
                <p className='text-lg font-semibold text-foreground'>
                  {weeklySummary.created}
                </p>
              </div>
              <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                <p className='text-xs text-muted-foreground'>Completed</p>
                <p className='text-lg font-semibold text-foreground'>
                  {weeklySummary.completed}
                </p>
              </div>
              <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                <p className='text-xs text-muted-foreground'>In progress</p>
                <p className='text-lg font-semibold text-foreground'>
                  {weeklySummary.inProgress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-5'>
          <Card
            size='sm'
            className='relative z-10 rounded-2xl border border-border/60 bg-card/70 shadow-sm h-full'
          >
            <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <CardTitle className='text-foreground'>
                  Priority Distribution
                </CardTitle>
                <CardDescription className='text-muted-foreground'>
                  Tasks breakdown by priority level
                </CardDescription>
              </div>
              <Badge variant='outline' className='rounded-full px-3 py-1'>
                Active tasks
              </Badge>
            </CardHeader>
            <CardContent>
              <div className='rounded-2xl border border-border/60 bg-background/80 p-4'>
                {tasksLoading && (
                  <div className='flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-sm text-muted-foreground'>
                    Loading priorities...
                  </div>
                )}
                {!tasksLoading && priorityData.length === 0 && (
                  <div className='flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-sm text-muted-foreground'>
                    Add tasks with priorities to see a breakdown.
                  </div>
                )}
                {!tasksLoading && priorityData.length > 0 && (
                  <ChartContainer
                    config={priorityConfig}
                    className='h-[250px] w-full aspect-auto'
                  >
                    <PieChart>
                      <Pie
                        data={priorityData}
                        dataKey='value'
                        nameKey='key'
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={105}
                        paddingAngle={2}
                        startAngle={90}
                        endAngle={450}
                      >
                        {priorityData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={`var(--color-${entry.key})`}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent nameKey='key' indicator='dot' />
                        }
                      />
                      <ChartLegend
                        content={<ChartLegendContent nameKey='key' />}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </div>
              {priorityData.length > 0 && (
                <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                    <p className='text-xs text-muted-foreground'>
                      Active priorities
                    </p>
                    <p className='text-lg font-semibold text-foreground'>
                      {priorityTotal}
                    </p>
                  </div>
                  <div className='rounded-2xl border border-border/60 bg-background/80 p-2.5'>
                    <p className='text-xs text-muted-foreground'>
                      Highest urgency
                    </p>
                    <p className='text-sm font-semibold text-foreground'>
                      {priorityData[0]?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
