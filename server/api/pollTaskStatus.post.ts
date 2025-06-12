export default defineEventHandler(async (event) => {
  const { taskIds } = await readBody<{
    taskIds: string[]
  }>(event)
  const { getTask } = useMaaTaskStorage()

  return Promise.all(taskIds.map(async taskId => (await getTask(taskId))?.status ?? null))
})
