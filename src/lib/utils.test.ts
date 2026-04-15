import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('resolve conflitos de utilitários Tailwind (último ganha)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('combina classes condicionais', () => {
    expect(cn('base', false && 'hidden', 'block')).toBe('base block')
  })
})
