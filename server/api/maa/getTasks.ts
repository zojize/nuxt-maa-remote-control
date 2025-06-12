export default defineEventHandler(async (event): Promise<{ tasks: MaaTask[] }> => {
  const body = await readBody<GetTasksRequestBody>(event)
  const { getAllTasksWithStatus } = useMaaTaskStorage()

  // eslint-disable-next-line no-console
  console.log('Received getTask request:', body)

  return {
    tasks: await getAllTasksWithStatus('PENDING'),
  }
})
