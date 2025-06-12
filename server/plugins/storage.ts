import memoryDriver from 'unstorage/drivers/memory'

export default defineNitroPlugin(() => {
  const storage = useStorage()
  const driver = memoryDriver()
  storage.mount('memory', driver)
})