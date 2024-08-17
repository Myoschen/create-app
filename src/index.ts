import pkg from '../package.json'

import pc from 'picocolors'
import { intro, outro } from '@clack/prompts'

async function main() {
  intro(pc.blue(pkg.name))
  outro('done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
