<script setup lang="ts">
type TaskWithId = MaaTask & {
  status?: MaaTaskStatus
  createdAt?: Date
  payload?: string
}

// const tasks = useLocalStorage<TaskWithId[]>('tasks', [])
const tasks = ref<TaskWithId[]>([])
const newTask = ref<{
  type: MaaTaskType
  params?: string
}>({
  type: 'LinkStart',
  params: '',
})

const lastPolled = ref<Date | null>(null)

// Available task types
const taskTypes: MaaTaskType[] = [
  'LinkStart',
  'LinkStart-Base',
  'LinkStart-WakeUp',
  'LinkStart-Combat',
  'LinkStart-Recruiting',
  'LinkStart-Mall',
  'LinkStart-Mission',
  'LinkStart-AutoRoguelike',
  'LinkStart-Reclamation',
  'Toolbox-GachaOnce',
  'Toolbox-GachaTenTimes',
  'CaptureImage',
  'Settings-ConnectAddress',
  'Settings-Stage1',
  'CaptureImageNow',
  'HeartBeat',
  'StopTask',
]

const { execute: createNewTask, data: newTaskId, error, status } = useFetch('/api/newTask', {
  method: 'POST',
  body: newTask,
  immediate: false,
  watch: false,
})

const isLoading = computed(() => status.value === 'pending')

// Add a new task
async function addTask() {
  if (!newTask.value.type)
    return

  let taskData: DistributiveOmit<MaaTask, 'id'>

  if (newTask.value.type.startsWith('Settings-') && newTask.value.params) {
    taskData = {
      type: newTask.value.type as MaaSettingsTask['type'],
      params: newTask.value.params,
    }
  }
  else {
    taskData = {
      type: newTask.value.type as MaaGeneralTask['type'],
    }
  }

  await createNewTask()

  const taskWithId: TaskWithId = {
    ...taskData,
    id: newTaskId.value!.id,
    status: 'PENDING',
    createdAt: new Date(),
  }

  tasks.value.unshift(taskWithId)
}

const pendingTaskIndices = computed(() =>
  tasks.value.flatMap((task, index) =>
    task.status === 'PENDING'
      ? [index]
      : [],
  ),
)
const pendingTaskIds = computed(() =>
  pendingTaskIndices.value.map(index => tasks.value[index]!.id),
)
const { execute: pollTaskStatus, data: polledTaskStatuses } = useFetch('/api/pollTaskStatus', {
  method: 'POST',
  body: { taskIds: pendingTaskIds },
  immediate: false,
  watch: false,
})

// Poll task statuses
async function pollTaskStatuses() {
  if (pendingTaskIds.value.length === 0)
    return

  const currentTaskIndices = [...pendingTaskIndices.value]
  await pollTaskStatus()
  polledTaskStatuses.value!.forEach((status, index) => {
    const idx = currentTaskIndices[index]!
    if (status && tasks.value[idx]) {
      tasks.value[idx].status = status

      // Fetch payload for successful tasks that should have payloads
      if (status === 'SUCCESS' && shouldHavePayload(tasks.value[idx].type)) {
        fetchTaskPayload(tasks.value[idx].id, idx)
      }
    }
  })

  lastPolled.value = new Date()
}

// Check if a task type should have a payload
function shouldHavePayload(taskType: MaaTaskType): boolean {
  return ['CaptureImage', 'CaptureImageNow', 'HeartBeat'].includes(taskType)
}

// Fetch payload for a specific task
async function fetchTaskPayload(taskId: string, taskIndex: number) {
  try {
    const response = await $fetch('/api/getTaskPayload', {
      query: { id: taskId },
    })

    const task = tasks.value[taskIndex]
    if (task) {
      task.payload = task.type === 'HeartBeat' && !response.payload
        ? 'no active task'
        : response.payload
    }
  }
  catch (error) {
    console.error('Failed to fetch payload for task', taskId, error)
  }
}

// Auto-poll every 2 seconds
useIntervalFn(pollTaskStatuses, 2000)

// Get status color
function getStatusColor(status?: MaaTaskStatus) {
  switch (status) {
    case 'SUCCESS': return 'text-green-600'
    case 'FAILURE': return 'text-red-600'
    case 'PENDING': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
}

// Get status icon
function getStatusIcon(status?: MaaTaskStatus) {
  switch (status) {
    case 'SUCCESS': return 'i-carbon-checkmark-filled text-green-600'
    case 'FAILURE': return 'i-carbon-close-filled text-red-600'
    case 'PENDING': return 'i-carbon-time text-yellow-600'
    default: return 'i-carbon-help text-gray-600'
  }
}

// Check if task requires params
const requiresParams = computed(() => {
  return newTask.value.type.startsWith('Settings-')
})

// Handle image load errors
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  const errorDiv = img.nextElementSibling as HTMLDivElement

  img.style.display = 'none'
  errorDiv.style.display = 'block'
}
</script>

<template>
  <div class="p-6 rounded bg-gray-200 flex flex-(col) gap-4 dark:bg-gray-800">
    <div class="pb-4 border-b-(1 gray-300) dark:border-b-gray-600">
      <form class="flex gap-4 items-start" @submit.prevent="addTask">
        <select
          id="taskType"
          v-model="newTask.type"
          class="px-2 py-1 pr-10 appearance-none border border-gray-300 rounded bg-gray-100 flex-1 w-full dark:border-gray-600 dark:bg-gray-700"
          required
        >
          <option v-for="type in taskTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <div v-if="requiresParams" class="flex-1">
          <input
            id="params"
            v-model="newTask.params"
            type="text"
            class="px-4 py-1 border border-gray-300 rounded bg-gray-100 w-full dark:border-gray-600 dark:bg-gray-700"
            placeholder="Enter task parameters..."
            required
          >
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="flex whitespace-nowrap items-center btn"
        >
          <i v-if="isLoading" class="i-carbon-rotate-clockwise animate-spin" />
          <i v-else class="i-carbon-add" />
          {{ isLoading ? 'Adding...' : 'Add Task' }}
        </button>
      </form>

      <div v-if="error" class="text-red-700 mt-4 p-3 border border-red-400 rounded bg-red-100 dark:text-red-300 dark:bg-red-900">
        {{ error.message }}
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">
            Tasks ({{ tasks.length }})
          </h2>
          <div v-if="lastPolled" class="text-sm text-gray-500 mt-1">
            Last polled: {{ lastPolled.toLocaleTimeString() }}
          </div>
        </div>
        <button
          class="btn"
          @click="pollTaskStatuses"
        >
          Refresh
        </button>
      </div>

      <div v-if="tasks.length === 0" class="text-gray-500 py-8 text-center rounded-lg bg-gray-100 dark:bg-gray-700">
        No tasks yet.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="p-4 border border-gray-200 rounded-lg bg-gray-100 transition-colors dark:border-gray-600 dark:bg-gray-700"
        >
          <div class="flex gap-4">
            <div class="flex-1">
              <div class="mb-2 flex gap-3 items-center">
                <div class="text-lg" :class="getStatusIcon(task.status)" />
                <h3 class="font-medium">
                  {{ task.type }}
                </h3>
                <span class="text-sm font-medium" :class="[getStatusColor(task.status)]">
                  {{ task.status || 'UNKNOWN' }}
                </span>
              </div>

              <div class="text-sm text-gray-600 space-y-1 dark:text-gray-400">
                <div><strong>ID:</strong> {{ task.id }}</div>
                <div v-if="'params' in task && task.params">
                  <strong>Params:</strong> {{ task.params }}
                </div>
                <div v-if="task.createdAt">
                  <strong>Created:</strong> {{ task.createdAt.toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Payload Display -->
            <div v-if="task.payload && shouldHavePayload(task.type)" class="flex-1 max-w-md">
              <div class="text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Payload:
              </div>

              <!-- Image payload for CaptureImage tasks -->
              <div v-if="task.type === 'CaptureImage' || task.type === 'CaptureImageNow'" class="rounded-lg bg-white overflow-hidden dark:bg-gray-800">
                <img
                  :src="`data:image/jpeg;base64,${task.payload}`"
                  :alt="`Screenshot from ${task.type}`"
                  class="h-auto max-h-48 w-full object-contain"
                  @error="handleImageError"
                >
                <div class="text-sm text-gray-500 p-3 text-center hidden">
                  Failed to load image
                </div>
              </div>

              <!-- Text payload for HeartBeat tasks -->
              <div v-else-if="task.type === 'HeartBeat'" class="text-sm font-mono p-3 rounded-lg bg-white dark:bg-gray-800">
                <pre class="whitespace-pre-wrap">{{ task.payload }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
