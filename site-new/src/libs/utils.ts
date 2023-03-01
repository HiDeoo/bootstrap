export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getSequence(start: number, end: number, step = 1) {
  const sequence = []

  for (let i = start; i <= end; i += step) {
    sequence.push(i)
  }

  return sequence
}
