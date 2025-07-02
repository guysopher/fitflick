import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      level?: number | null
      coins?: number | null
      streak?: number | null
      totalWorkouts?: number | null
      badges?: string[] | null
      waterCups?: number | null
      unlockedCostumes?: string[] | null
      currentCostume?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    level?: number | null
    coins?: number | null
    streak?: number | null
    totalWorkouts?: number | null
    badges?: string[] | null
    waterCups?: number | null
    unlockedCostumes?: string[] | null
    currentCostume?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
  }
} 