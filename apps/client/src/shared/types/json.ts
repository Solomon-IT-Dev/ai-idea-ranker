export type JsonPrimitive = string | number | boolean | null
export type Json = JsonPrimitive | Record<string, unknown> | Json[]
