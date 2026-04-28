import { ref } from 'vue'

export type LogEventType =
  | 'info'
  | 'submit'
  | 'success'
  | 'fail'
  | 'field-error'
  | 'validator'
  | 'request'
  | 'response'

export interface LogEvent {
  id: number
  ts: number
  type: LogEventType
  message: string
  data?: unknown
}

let nextId = 0

export function useEventLog(max = 200) {
  const events = ref<LogEvent[]>([])

  function log(type: LogEventType, message: string, data?: unknown) {
    events.value.unshift({ id: nextId++, ts: Date.now(), type, message, data })
    if (events.value.length > max) events.value.length = max
  }

  function clear() {
    events.value = []
  }

  return { events, log, clear }
}
