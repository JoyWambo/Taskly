import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectInput } from '@/components/shared/Inputs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Sparkles,
  X,
  Plus,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetCategoriesQuery } from '@/lib/slices/categorySlice';
import { useDateTimeFormatter } from '@/hooks/useDateTimeFormatter';

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().optional(),
  deadline: z.date().optional(),
  estimatedHours: z.number().min(0, 'Hours must be positive').optional(),
  actualHours: z.number().min(0, 'Hours must be positive').optional(),
  progression: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
});

export default function TaskForm({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
  errorMessage,
}) {
  const { formatDate } = useDateTimeFormatter();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const dialogContentRef = React.useRef(null);
  const categoryOptions = React.useMemo(
    () =>
      categories.map((cat) => ({
        value: cat._id,
        label: cat.name,
      })),
    [categories]
  );

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: '',
      deadline: undefined,
      estimatedHours: 0,
      actualHours: 0,
      progression: 0,
      tags: [],
    },
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        category: task.category?._id || task.category || '',
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        progression: task.progression || 0,
        tags: task.tags || [],
      });
      setSubtasks(task.subtasks || []);
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        category: '',
        deadline: undefined,
        estimatedHours: 0,
        actualHours: 0,
        progression: 0,
        tags: [],
      });
      setSubtasks([]);
    }
  }, [task, form]);

  const handleFormSubmit = (values) => {
    const cleanedData = {
      ...values,
      category: values.category || undefined,
      deadline: values.deadline || undefined,
      estimatedHours: Number(values.estimatedHours) || 0,
      actualHours: task ? Number(values.actualHours) || 0 : undefined,
      progression: task ? Number(values.progression) || 0 : undefined,
      tags: values.tags.filter((tag) => tag.trim()),
      subtasks: subtasks,
    };

    if (!task) {
      delete cleanedData.actualHours;
      delete cleanedData.progression;
    }

    onSubmit(cleanedData);
  };

  const addTag = () => {
    const currentTags = form.getValues('tags');
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = form.getValues('tags');
    form.setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addSubtask = () => {
    if (subtaskInput.trim() && subtaskInput.length <= 100) {
      setSubtasks([
        ...subtasks,
        {
          title: subtaskInput.trim(),
          isCompleted: false,
          completedAt: null,
        },
      ]);
      setSubtaskInput('');
    }
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const toggleSubtask = (index) => {
    setSubtasks(
      subtasks.map((st, i) =>
        i === index
          ? {
              ...st,
              isCompleted: !st.isCompleted,
              completedAt: !st.isCompleted ? new Date() : null,
            }
          : st
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        className='max-w-4xl sm:max-w-4xl w-[95vw] sm:w-[92vw] lg:w-full max-h-[85vh] overflow-y-auto border-border/60 bg-card/95'
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Sparkles className='w-5 h-5 text-primary' />
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task
              ? 'Update task details, scheduling, and progress.'
              : 'Create a new task with clear details and priorities.'}
          </DialogDescription>
          {errorMessage && (
            <FormMessage className='mt-2'>{errorMessage}</FormMessage>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className='space-y-5'
          >
            <div className='flex items-center gap-2'>
              <div className='h-px flex-1 bg-border' />
              <h3 className='text-xs font-semibold uppercase text-muted-foreground tracking-wide'>
                Essentials
              </h3>
              <div className='h-px flex-1 bg-border' />
            </div>

            <div className='grid gap-4 lg:grid-cols-[1.35fr_0.65fr]'>
              <div className='rounded-2xl border border-border/60 bg-background/80 p-4 space-y-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Task details
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Capture the focus and context for this task.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='What needs to be done?'
                          className='h-10'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Add detailed description...'
                          className='min-h-24 resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share context, dependencies, or acceptance notes.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className='rounded-2xl border border-border/60 bg-background/80 p-4 space-y-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Planning
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Set the priority and current status.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='category'
                  render={({ field, fieldState }) => {
                    const selectedCategory = categoryOptions.find(
                      (option) => option.value === field.value
                    );
                    return (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <SelectInput
                            value={selectedCategory || null}
                            onChange={(option) =>
                              field.onChange(option?.value || '')
                            }
                            options={[
                              { value: '', label: 'No Category' },
                              ...categoryOptions,
                            ]}
                            placeholder='Select category'
                            isClearable
                            fieldState={fieldState}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <SelectInput
                          value={
                            priorities.find(
                              (option) => option.value === field.value
                            ) || null
                          }
                          onChange={(option) =>
                            field.onChange(option?.value || 'medium')
                          }
                          options={priorities.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                          placeholder='Select priority'
                          isClearable={false}
                          fieldState={fieldState}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <SelectInput
                          value={
                            statusOptions.find(
                              (option) => option.value === field.value
                            ) || null
                          }
                          onChange={(option) =>
                            field.onChange(option?.value || 'pending')
                          }
                          options={statusOptions}
                          placeholder='Select status'
                          isClearable={false}
                          fieldState={fieldState}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='h-px flex-1 bg-border' />
              <h3 className='text-xs font-semibold uppercase text-muted-foreground tracking-wide'>
                Timeline and tracking
              </h3>
              <div className='h-px flex-1 bg-border' />
            </div>

            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='rounded-2xl border border-border/60 bg-background/80 p-4 space-y-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Schedule
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Set the target timeline and estimate effort.
                  </p>
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='deadline'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type='button'
                                variant='outline'
                                className={cn(
                                  'h-10 w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {field.value
                                  ? formatDate(field.value)
                                  : 'Pick a date'}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-auto p-0'
                            align='start'
                            container={dialogContentRef}
                          >
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date().setHours(0, 0, 0, 0)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='estimatedHours'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='0'
                            step='0.5'
                            placeholder='0'
                            className='h-10'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='rounded-2xl border border-border/60 bg-background/80 p-4 space-y-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Tracking
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Update hours and progress once work begins.
                  </p>
                </div>

                {task ? (
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='actualHours'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actual Hours</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min='0'
                              step='0.5'
                              placeholder='0'
                              className='h-10'
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='progression'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center justify-between'>
                            Progress
                            <span className='text-sm text-primary font-medium'>
                              {field.value}%
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                              max={100}
                              step={5}
                              className='w-full'
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className='rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground'>
                    Progress tracking and actual hours are available after the
                    task is created.
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='h-px flex-1 bg-border' />
              <h3 className='text-xs font-semibold uppercase text-muted-foreground tracking-wide'>
                Tags
              </h3>
              <div className='h-px flex-1 bg-border' />
            </div>

            <div className='rounded-2xl border border-border/60 bg-background/80 p-4 space-y-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Tags
                </p>
                <p className='text-sm text-muted-foreground'>
                  Group tasks by keywords or projects.
                </p>
              </div>

              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormDescription>
                      Press Enter or click the plus to add multiple tags.
                    </FormDescription>
                    <div className='space-y-2'>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Add a tag...'
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          className='flex-1 h-10'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          onClick={addTag}
                          disabled={!tagInput.trim()}
                        >
                          <Plus className='w-4 h-4' />
                        </Button>
                      </div>

                      {field.value?.length > 0 ? (
                        <div className='flex flex-wrap gap-1.5'>
                          {field.value.map((tag, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='flex items-center gap-1 px-2 py-1 text-xs'
                            >
                              #{tag}
                              <button
                                type='button'
                                onClick={() => removeTag(tag)}
                                className='ml-1 hover:bg-destructive/20 rounded-full p-0.5'
                              >
                                <X className='w-2.5 h-2.5' />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className='text-xs text-muted-foreground'>
                          No tags added yet.
                        </p>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex items-center gap-2'>
              <div className='h-px flex-1 bg-border' />
              <h3 className='text-xs font-semibold uppercase text-muted-foreground tracking-wide'>
                Subtasks
              </h3>
              <div className='h-px flex-1 bg-border' />
            </div>

            <div className='rounded-2xl border border-border/60 bg-background/80 p-4 space-y-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Subtasks
                </p>
                <p className='text-sm text-muted-foreground'>
                  Break down your task into smaller actionable steps.
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Add a subtask...'
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                    maxLength={100}
                    className='flex-1 h-10'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={addSubtask}
                    disabled={!subtaskInput.trim() || subtaskInput.length > 100}
                  >
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>

                {subtasks.length > 0 ? (
                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {subtasks.map((subtask, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-background hover:bg-muted/50 transition-colors group'
                      >
                        <Checkbox
                          checked={subtask.isCompleted}
                          onCheckedChange={() => toggleSubtask(index)}
                          className='shrink-0'
                        />
                        <span
                          className={`flex-1 text-sm ${
                            subtask.isCompleted
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {subtask.title}
                        </span>
                        {subtask.isCompleted && (
                          <CheckCircle2 className='w-4 h-4 text-emerald-500 shrink-0' />
                        )}
                        <button
                          type='button'
                          onClick={() => removeSubtask(index)}
                          className='opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 rounded-full p-1 shrink-0'
                        >
                          <X className='w-3.5 h-3.5 text-destructive' />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground text-center'>
                    No subtasks added yet. Add subtasks to break down your task
                    into smaller steps.
                  </div>
                )}

                {subtasks.length > 0 && (
                  <p className='text-xs text-muted-foreground flex items-center gap-2'>
                    <Circle className='w-3 h-3' />
                    {subtasks.filter((st) => st.isCompleted).length} of{' '}
                    {subtasks.length} completed
                  </p>
                )}
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-2 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : task
                  ? 'Update Task'
                  : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
