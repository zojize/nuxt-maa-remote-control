export default defineEventHandler(async (event): Promise<{ payload: string }> => {
  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task ID is required',
    })
  }

  const { getTask, hasTask } = useMaaTaskStorage()

  if (!await hasTask(id)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task payload not found',
    })
  }

  const task = await getTask(id)
  const payload = task?.payload ?? ''

  return { payload }
})
