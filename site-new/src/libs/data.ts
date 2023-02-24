import fs from 'node:fs'
import yaml from 'js-yaml'
import { z } from 'zod'
import { zNamedHexColor } from './validation'

// An object containing all the data types and their associated schema. The key should match the name of the data file
// in the `./site/data/` directory.
const dataDefinitions = {
  grays: z
    .tuple([
      zNamedHexColor(z.literal(100)),
      zNamedHexColor(z.literal(200)),
      zNamedHexColor(z.literal(300)),
      zNamedHexColor(z.literal(400)),
      zNamedHexColor(z.literal(500)),
      zNamedHexColor(z.literal(600)),
      zNamedHexColor(z.literal(700)),
      zNamedHexColor(z.literal(800)),
      zNamedHexColor(z.literal(900)),
    ])
    .transform((val) => {
      // Map array entries to an object with the name as key and the hex color as value for easier lookup.
      const grays = {} as Record<(typeof val)[number]['name'], string>

      for (const { name, hex } of val) {
        grays[name] = hex
      }

      return grays
    }),
} satisfies Record<string, DataSchema>

let data = new Map<DataType, z.infer<DataSchema>>()

// A helper to get data loaded fom a yml file in the `./site/data/` directory. If the data does not match its associated
// schema from `dataDefinitions`, an error is thrown to indicate that the data file is invalid and some action is
// required.
export function getData<TType extends DataType>(type: TType): z.infer<(typeof dataDefinitions)[TType]> {
  if (data.has(type)) {
    // Returns the data if it has already been loaded.
    return data.get(type)
  }

  const dataPath = `./site/data/${type}.yml`

  try {
    // Load the data from the yml  file.
    const rawData = yaml.load(fs.readFileSync(dataPath, 'utf8'))

    // Parse the data using the data schema to validate its content and get back a fully typed data object.
    const parsedData = dataDefinitions[type].parse(rawData)

    // Cache the data.
    data.set(type, parsedData)

    return parsedData
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`The \`${dataPath}\` file content is invalid:`, error.issues)
    }

    throw new Error(`Failed to load data from \`${dataPath}\``, { cause: error })
  }
}

type DataType = keyof typeof dataDefinitions
type DataSchema = z.ZodTypeAny
