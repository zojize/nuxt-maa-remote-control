type MaaTaskExtra = MaaTask & {
  status: MaaTaskStatus
  payload?: string
}

export function useMaaTaskStorage() {
  const storage = useStorage('memory')

  return {
    setTask(task: MaaTask | MaaTaskExtra) {
      return storage.setItem<MaaTaskExtra>(
        `task:${task.id}`,
        'status' in task ? task : { ...task, status: 'PENDING' },
      )
    },
    async setTaskStatus(taskId: string, status: MaaTaskStatus, payload?: string) {
      if (!await storage.hasItem(`task:${taskId}`)) {
        throw new Error(`Task with ID ${taskId} does not exist`)
      }
      const task = await storage.getItem<MaaTaskExtra>(`task:${taskId}`)
      return storage.setItem<MaaTaskExtra>(`task:${taskId}`, { ...task!, status, payload })
    },
    hasTask(taskId: string) {
      return storage.hasItem(`task:${taskId}`)
    },
    getTask(taskId: string) {
      return storage.getItem<MaaTaskExtra>(`task:${taskId}`)
    },
    async getAllTasksWithStatus(status: MaaTaskStatus) {
      const tasks = await storage.getItems<MaaTaskExtra>(await storage.getKeys())
      return tasks.flatMap(({ value: { status: s, ...task } }) => status === s ? task : [])
    },
  }
}
