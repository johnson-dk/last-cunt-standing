export type PaymentStatus = 'paid' | 'unpaid' | 'pending'
export type PlayerStatus = 'active' | 'eliminated'

export interface Player {
  id: string
  name: string
  paymentStatus: PaymentStatus
  status: PlayerStatus
  eliminatedWeek?: number
}

export interface Pick {
  playerId: string
  gameweek: number
  teamId: number
  teamName: string
  result?: 'win' | 'loss' | 'void'
}

export interface PrizeEntry {
  position: number
  percentage: number
  label: string
}

export interface PoolSettings {
  name: string
  entryFee: number
  prizeStructure: PrizeEntry[]
  currentGameweek: number
}

export interface PoolData {
  settings: PoolSettings
  players: Player[]
  picks: Pick[]
}

export interface FPLTeam {
  id: number
  name: string
  short_name: string
}

export interface FPLFixture {
  id: number
  event: number | null
  team_h: number
  team_a: number
  team_h_score: number | null
  team_a_score: number | null
  finished: boolean
}
