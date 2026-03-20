import { z } from 'zod'

export const accountNameSchema = z
  .string()
  .min(2, '账户名称至少 2 个字符')
  .max(50, '账户名称不能超过 50 个字符')
  .trim()

export const accountDescriptionSchema = z
  .string()
  .max(200, '描述不能超过 200 个字符')
  .optional()
  .or(z.literal(''))

export const createAccountSchema = z.object({
  name: accountNameSchema,
  description: accountDescriptionSchema,
})

export const updateAccountSchema = z.object({
  name: accountNameSchema.optional(),
  description: accountDescriptionSchema,
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
