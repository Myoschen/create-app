import dotenv from 'dotenv'
import path from 'path'
import { z } from 'zod'

dotenv.config({
  path: [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
  ],
})

const envSchema = z.object({
  EXPRESS_PORT: z.coerce.number().default(4000),
})

export const env = envSchema.parse(process.env)
