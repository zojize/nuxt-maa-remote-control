type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

interface GetTasksRequestBody {
  user: string
  device: string
}

/* eslint-disable style/indent-binary-ops */
type MaaTaskType
  // Sequential tasks
  = 'LinkStart'
  | 'LinkStart-Base'
  | 'LinkStart-WakeUp'
  | 'LinkStart-Combat'
  | 'LinkStart-Recruiting'
  | 'LinkStart-Mall'
  | 'LinkStart-Mission'
  | 'LinkStart-AutoRoguelike'
  | 'LinkStart-Reclamation'
  | 'Toolbox-GachaOnce'
  | 'Toolbox-GachaTenTimes'
  | 'CaptureImage'
  | 'Settings-ConnectAddress'
  | 'Settings-Stage1'
  // Instant tasks
  | 'CaptureImageNow'
  | 'HeartBeat'
  | 'StopTask'

interface MaaSettingsTask {
  type: MaaTaskType & `Settings-${string}`
  id: string
  params: string
}

interface MaaGeneralTask {
  type: Exclude<MaaTaskType, MaaSettingsTask['type']>
  id: string
}

type MaaTask = MaaSettingsTask | MaaGeneralTask

type MaaTaskStatus = 'PENDING' | 'SUCCESS' | 'FAILURE'

interface MaaStatusReport {
  user: string
  device: string
  task: string
  status: 'SUCCESS' | 'FAILURE'
  payload: string
}
