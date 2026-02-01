import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackgroundPattern } from '@/components/background-pattern';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const previewTasks = [
  {
    title: 'Finalize sprint plan',
    meta: 'Today · High priority',
    status: 'In progress',
    statusTone: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    title: 'Review client feedback',
    meta: 'Tomorrow · Medium priority',
    status: 'Queued',
    statusTone: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  },
  {
    title: 'Prepare release notes',
    meta: 'Fri · Low priority',
    status: 'Ready',
    statusTone: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
];

const featureCards = [
  {
    title: 'Priority lanes',
    description:
      'Separate urgent work from steady progress with flexible views.',
    icon: Layers,
  },
  {
    title: 'Deadline clarity',
    description: 'Know what is next with smart due dates and reminders.',
    icon: Clock3,
  },
  {
    title: 'Progress intelligence',
    description:
      'Track completion rates and momentum without manual reporting.',
    icon: TrendingUp,
  },
];

const workflowSteps = [
  {
    title: 'Capture everything',
    description: 'Quickly add tasks, notes, and ideas in one place.',
  },
  {
    title: 'Plan the week',
    description: 'Batch work by category, priority, and deadline.',
  },
  {
    title: 'Finish with focus',
    description: 'Stay on pace with progress indicators and status cues.',
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const getCurrentDateTimeInfo = () => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[now.getDay()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return {
      label: 'Today',
      formatted: `${dayName} · ${hours}:${minutes}`,
    };
  };

  const dateTimeInfo = getCurrentDateTimeInfo();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };

  const reveal = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className='relative isolate overflow-hidden'>
      <BackgroundPattern />
      <div className='relative z-10'>
        <motion.section
          className='relative pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20'
          initial='hidden'
          animate='show'
          variants={stagger}
        >
          <div className='absolute -top-32 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-primary/30 via-transparent to-transparent blur-3xl' />
          <div className='absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-primary/20 via-transparent to-transparent blur-3xl' />

          <div className='container relative z-10 px-4 sm:px-6 lg:px-8'>
            <div className='grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16'>
              <motion.div variants={fadeUp}>
                <Badge variant='secondary' className='rounded-full px-4 py-1'>
                  New for Taskly: Smart recurring routines
                </Badge>
                <h1 className='mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl'>
                  Plan, track, and finish
                  <span className='block bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent'>
                    with one calm workspace
                  </span>
                </h1>
                <p className='mt-5 max-w-2xl text-base text-foreground/75 sm:text-lg'>
                  Taskly keeps priorities visible, deadlines honest, and
                  progress addictive. Break big goals into daily wins and stay
                  in flow with smarter scheduling.
                </p>

                <div className='mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center'>
                  <Button
                    size='lg'
                    className='rounded-full'
                    onClick={() => navigate('/signup')}
                  >
                    Get started
                    <ArrowUpRight className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='lg'
                    className='rounded-full'
                    onClick={() => navigate('/login')}
                  >
                    <Sparkles className='h-4 w-4' />
                    Sign in
                  </Button>
                </div>

                <div className='mt-8 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-6'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-primary' />
                    No setup required
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-primary' />
                    Secure JWT auth
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-primary' />
                    Works on every device
                  </div>
                </div>
              </motion.div>

              <motion.div
                className='relative'
                variants={fadeIn}
                transition={{ delay: 0.1 }}
              >
                <div className='absolute -right-6 -top-6 h-full w-full rounded-3xl border border-primary/20 bg-primary/10 z-10' />
                <div className='relative rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-primary/10 backdrop-blur z-20'>
                  <div className='flex items-center justify-between'>
                    <Badge variant='secondary' className='rounded-full'>
                      {dateTimeInfo.label}
                    </Badge>
                    <span className='text-xs text-muted-foreground'>
                      {dateTimeInfo.formatted}
                    </span>
                  </div>
                  <h3 className='mt-4 text-lg font-semibold text-foreground'>
                    Daily focus
                  </h3>

                  <div className='mt-4 space-y-3'>
                    {previewTasks.map((task) => (
                      <motion.div
                        key={task.title}
                        className='flex items-start justify-between gap-3 rounded-2xl border border-border/50 bg-background/80 p-3'
                        variants={reveal}
                      >
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {task.title}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {task.meta}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${task.statusTone}`}
                        >
                          {task.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className='mt-6 rounded-2xl border border-border/50 bg-background/80 p-4'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium text-foreground'>
                        Weekly momentum
                      </span>
                      <span className='text-muted-foreground'>86%</span>
                    </div>
                    <div className='mt-2 h-2 w-full rounded-full bg-muted'>
                      <div className='h-full w-[86%] rounded-full bg-gradient-to-r from-primary to-indigo-400' />
                    </div>
                    <div className='mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <CheckCircle2 className='h-3 w-3 text-primary' />
                        14 done
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock3 className='h-3 w-3 text-primary' />5 due next
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id='features'
          className='scroll-mt-4 py-2 sm:py-4 lg:py-6'
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <div className='container px-4 sm:px-6 lg:px-8'>
            <div className='max-w-2xl'>
              <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>
                Why Taskly
              </p>
              <h2 className='mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                A task system that feels quiet, but powerful.
              </h2>
              <p className='mt-4 text-base text-muted-foreground'>
                Taskly blends clarity and momentum, so every task feels
                approachable. Keep your work organized, focused, and easy to
                finish.
              </p>
            </div>

            <div className='mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {featureCards.map((feature) => (
                <motion.div
                  key={feature.title}
                  className='rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md'
                  variants={reveal}
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <feature.icon className='h-5 w-5' />
                  </div>
                  <h3 className='mt-4 text-lg font-semibold text-foreground'>
                    {feature.title}
                  </h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id='workflow'
          className='scroll-mt-24 py-12 sm:py-16 lg:py-20'
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <div className='container grid gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:px-8'>
            <motion.div
              className='rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8'
              variants={reveal}
            >
              <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>
                Workflow
              </p>
              <h2 className='mt-3 text-3xl font-semibold tracking-tight text-foreground'>
                Move from intention to done, without the chaos.
              </h2>
              <p className='mt-4 text-base text-muted-foreground'>
                Organize tasks by category, status, and priority. See what
                matters now, and what can wait.
              </p>
            </motion.div>

            <div className='space-y-4 sm:space-y-6'>
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className='flex gap-4 rounded-2xl border border-border/60 bg-card/60 p-5'
                  variants={reveal}
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className='text-base font-semibold text-foreground'>
                      {step.title}
                    </h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* <motion.section
          id='insights'
          className='scroll-mt-24 py-12 sm:py-16 lg:py-20'
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <div className='container grid gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-8'>
            <motion.div variants={reveal}>
              <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>
                Insights
              </p>
              <h2 className='mt-3 text-3xl font-semibold tracking-tight text-foreground'>
                See your momentum without spreadsheets.
              </h2>
              <p className='mt-4 text-base text-muted-foreground'>
                Taskly dashboards surface completion rates, overdue risks, and
                category workload so you can rebalance fast.
              </p>
              <div className='mt-6 flex flex-wrap items-center gap-3'>
                <Badge variant='secondary' className='rounded-full px-3 py-1'>
                  Completion rate
                </Badge>
                <Badge variant='secondary' className='rounded-full px-3 py-1'>
                  Priority mix
                </Badge>
                <Badge variant='secondary' className='rounded-full px-3 py-1'>
                  Weekly trends
                </Badge>
              </div>
            </motion.div>
            <motion.div
              className='rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm'
              variants={reveal}
            >
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-foreground'>
                  This week
                </span>
                <span className='text-xs text-muted-foreground'>
                  +12% momentum
                </span>
              </div>
              <div className='mt-4 grid gap-3'>
                <div className='rounded-2xl border border-border/50 bg-background/70 p-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Completed</span>
                    <span className='font-semibold text-foreground'>
                      28 tasks
                    </span>
                  </div>
                  <div className='mt-2 h-2 rounded-full bg-muted'>
                    <div className='h-full w-[72%] rounded-full bg-primary' />
                  </div>
                </div>
                <div className='rounded-2xl border border-border/50 bg-background/70 p-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>On track</span>
                    <span className='font-semibold text-foreground'>86%</span>
                  </div>
                  <div className='mt-2 h-2 rounded-full bg-muted'>
                    <div className='h-full w-[86%] rounded-full bg-emerald-500' />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id='security'
          className='scroll-mt-24 py-12 sm:py-16 lg:py-20'
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <div className='container px-4 sm:px-6 lg:px-8'>
            <div className='rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-8'>
              <div className='flex flex-col gap-6 md:flex-row md:items-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                  <ShieldCheck className='h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-2xl font-semibold text-foreground'>
                    Secure by default
                  </h2>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Built on JWT authentication with protected API routes, so
                    every list and task stays private to its owner.
                  </p>
                </div>
                <Button
                  size='lg'
                  className='rounded-full'
                  onClick={() => navigate('/signup')}
                >
                  Start organizing
                </Button>
              </div>
            </div>
          </div>
        </motion.section> */}
      </div>
    </div>
  );
}
