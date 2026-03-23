// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db, users } from "@/lib/db"   // ← fix import path
import { eq } from "drizzle-orm"
import { z } from "zod"
import bcrypt from "bcryptjs"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) {
            console.log("❌ Validation failed:", parsed.error.issues)
            return null
          }

          console.log("✓ Validation passed for:", parsed.data.email)

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, parsed.data.email))
            .limit(1)

          console.log("User found:", user ? "✓ YES" : "❌ NO")

          if (!user || !user.password) {
            console.log("❌ No user or no password")
            return null
          }

          const passwordMatch = await bcrypt.compare(
            parsed.data.password,
            user.password
          )

          console.log("Password match:", passwordMatch ? "✓ YES" : "❌ NO")

          if (!passwordMatch) return null

          console.log("✓ Auth successful for:", user.email)
          return { id: user.id, name: user.name, email: user.email }

        } catch (err) {
          console.error("❌ Auth error:", err)
          return null
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})