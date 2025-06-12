export default defineEventHandler(async (event) => {
  const body = await readBody<MaaStatusReport>(event)
  const { setTaskStatus, hasTask } = useMaaTaskStorage()

  // eslint-disable-next-line no-console
  console.log('Received Maa status report:', body)

  if (!await hasTask(body.task)) {
    return
  }

  await setTaskStatus(body.task, body.status, body.payload)
})
