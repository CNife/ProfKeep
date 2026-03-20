import { z } from 'zod'

export const fundCodeSchema = z
  .string()
  .regex(/^\d{6}$/, '基金代码必须是 6 位数字')

export const sharesSchema = z
  .number()
  .positive('份额必须大于 0')

export const costPriceSchema = z
  .number()
  .positive('成本价必须大于 0')

export const addHoldingSchema = z.object({
  fundCode: fundCodeSchema,
  shares: sharesSchema,
  costPrice: costPriceSchema,
})

export const updateHoldingSchema = z.object({
  shares: sharesSchema.optional(),
  costPrice: costPriceSchema.optional(),
})

export type AddHoldingInput = z.infer<typeof addHoldingSchema>
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>
