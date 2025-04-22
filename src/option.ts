import z from 'zod'

export const optionSchema = z.object({
  vars: z.record(z.string(), z.array(z.string())),
  tasks: z.array(
    z.object({
      name: z.string(),
      input: z.array(
        z.object({
          name: z.string(),
          method: z
            .literal('input')
            .or(z.literal('select'))
            .or(z.literal('transform')),
          from: z.optional(z.string()),
          transform: z.optional(z.literal('upper'))
        })
      ),
      files: z.array(z.string()),
      chart: z.optional(z.string())
    })
  )
})

export type Option = z.infer<typeof optionSchema>

export type Task = Option['tasks'][number]
