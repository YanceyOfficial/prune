import { writeFileSync, readdirSync, readFileSync } from 'fs'
import process from 'process'
import path from 'path'
import sharp from 'sharp'
import heicConvert from 'heic-convert'
import colors from 'ansi-colors'
import cliProgress, { SingleBar } from 'cli-progress'
import { randomSeries } from 'yancey-js-util'

const createBar = (total: number) => {
  const bar = new cliProgress.SingleBar(
    {
      format:
        'Optimizing |' +
        colors.cyan('{bar}') +
        '| {percentage}% || {value}/{total} Files',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    },
    cliProgress.Presets.rect
  )
  bar.start(total, 0)

  return bar
}

const main = async (input: string, output: string) => {
  const res = []
  try {
    const files = readdirSync(input)

    const bar = createBar(files.length)
    for (const file of files) {
      const filePath = path.join(input, file)
      const inputBuffer = readFileSync(filePath)
      await processImage(inputBuffer, output, bar, res)
    }
  } catch (error) {
    console.log(`[getImageError] ${error}`)
  } finally {
    writeFileSync(path.join(output, 'output.txt'), res.join('\n'))
    process.exit(0)
  }
}

const processImage = async (
  inputBuffer: Buffer,
  output: string,
  bar: SingleBar,
  res: string[]
) => {
  try {
    const fileName = `${randomSeries(10)}_${+new Date()}`

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 1
    })

    const image = sharp(outputBuffer)

    await image
      .resize(600)
      .toFormat('jpg', { quality: 80 })
      .toFile(path.join(output, `${fileName}.jpg`))

      await image
      .resize(600)
      .toFormat('webp', { quality: 80 })
      .toFile(path.join(output, `${fileName}.webp`))

    bar.increment()

    res.push(`![${res.length}](https://edge.yancey.app/beg/${fileName}.webp)`)
  } catch (error) {
    console.log(`[processImage] ${error}`)
  }
}

main(path.join(process.cwd(), 'input'), path.join(process.cwd(), 'output'))
