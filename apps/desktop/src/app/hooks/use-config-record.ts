import { useQuery } from '@tanstack/react-query'

import { getKenXCodeConfigRecord } from '@/kenxcode'
import { queryClient, writeCache } from '@/lib/query-client'
import type { KenXCodeConfigRecord } from '@/types/kenxcode'

// One shared cache for the whole profile config record (`GET /api/config`).
// Every settings surface (MCP, model, config) reads and writes through this key
// so a save in one shows in the others, and revisiting a tab paints the cache
// instead of blanking on a fresh fetch.
//
// Distinct from session/hooks/use-kenxcode-config.ts, which is side-effecting —
// it pushes personality/cwd/voice/… into the session stores for live chat.
export const KENXCODE_CONFIG_KEY = ['kenxcode-config-record'] as const

// staleTime 0 → serve cache instantly, background-revalidate on every mount.
export const useKenXCodeConfigRecord = () =>
  useQuery({ queryKey: KENXCODE_CONFIG_KEY, queryFn: getKenXCodeConfigRecord, staleTime: 0 })

export const setKenXCodeConfigCache = writeCache<KenXCodeConfigRecord>(KENXCODE_CONFIG_KEY)

export const invalidateKenXCodeConfig = () => queryClient.invalidateQueries({ queryKey: KENXCODE_CONFIG_KEY })
