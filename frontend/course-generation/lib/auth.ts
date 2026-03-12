import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Mock user database - Replace with actual database
const users = [
  {
    id: '1',
    email: 'learner@example.com',
    name: 'John Learner',
    password: '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0', // password: password123
    role: 'learner' as const,
  },
  {
    id: '2',
    email: 'educator@example.com',
    name: 'Jane Educator',
    password: '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0',
    role: 'educator' as const,
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0',
    role: 'admin' as const,
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = users.find((u) => u.email === credentials.email)

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id
        (session.user as any).role = (token as any).role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
