import { loadDataset } from '../src/services/loadDataset'
import { validateDataset } from '../src/services/validation/validateDataset'

async function main() {
  console.log('')
  console.log('Haaland Road to 1000')
  console.log('Dataset Validation')
  console.log('-------------------')

  const dataset = await loadDataset()
  const result = validateDataset(dataset)

  console.log(`Goals: ${dataset.goals.length}`)
  console.log(`Sources: ${dataset.sources.length}`)
  console.log(`Errors: ${result.errors.length}`)
  console.log(`Warnings: ${result.warnings.length}`)
  console.log('')

  if (result.errors.length > 0) {
    console.log('ERRORS')

    for (const issue of result.errors) {
      console.log(
        `[${issue.code}] ${issue.message}`,
      )
    }

    console.log('')
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS')

    for (const issue of result.warnings) {
      console.log(
        `[${issue.code}] ${issue.message}`,
      )
    }

    console.log('')
  }

  if (result.valid) {
    console.log('Dataset validation passed.')
  } else {
    console.error('Dataset validation failed.')
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error('Validation script crashed.')
  console.error(error)

  process.exitCode = 1
})