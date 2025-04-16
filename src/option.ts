import z from 'zod'

export const optionSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string(),
      input: z.array(
        z.string().or(
          z.object({
            name: z.string(),
            source: z.string(),
            transform: z.literal('upper')
          })
        )
      ),
      files: z.array(z.string())
    })
  )
})

export type Option = z.infer<typeof optionSchema>

export type Task = Option['tasks'][number]
