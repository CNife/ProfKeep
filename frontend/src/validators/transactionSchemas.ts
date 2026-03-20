import { z } from 'zod'
import { fundCodeSchema, sharesSchema } from './holdingSchemas'

export const transactionTypeSchema = z.enum(['buy', 'sell', 'dividend'])

export const amountSchema = z
  .number()
  .positive('金额必须大于 0')

export const transactionDateSchema = z
  .string()
  .refine(
    (date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime()) && parsed <= new Date()
    },
    { message: '日期必须有效且不能超过今天' }
  )

export const feeSchema = z
  .number()
  .min(0, '手续费不能为负数')
  .optional()
  .default(0)

export const remarkSchema = z
  .string()
  .max(200, '备注不能超过 200 个字符')
  .optional()
  .or(z.literal(''))

export const createTransactionSchema = z.object({
  fundCode: fundCodeSchema,
  type: transactionTypeSchema,
  date: transactionDateSchema,
  shares: sharesSchema,
  amount: amountSchema,
  fee: feeSchema,
  remark: remarkSchema,
})

export const updateTransactionSchema = z.object({
  shares: sharesSchema.optional(),
  amount: amountSchema.optional(),
  fee: feeSchema,
  remark: remarkSchema,
})

export type TransactionType = z.infer<typeof transactionTypeSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
