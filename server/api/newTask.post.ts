import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<DistributiveOmit<MaaTask, 'id'>>(event)
  const { setTask } = useMaaTaskStorage()

  const id = randomUUID()

  await setTask({ ...body, id })

  return { id }
})
