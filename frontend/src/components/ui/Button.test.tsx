import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test/utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    )

    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  describe('variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r')
    })

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-bg-card')
    })

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })
  })

  describe('sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>)
      expect(screen.getByRole('button')).toHaveClass('px-5', 'py-2.5')
    })

    it('applies small size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('applies large size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
    })
  })

  describe('fullWidth', () => {
    it('does not apply full width by default', () => {
      render(<Button>Normal</Button>)
      expect(screen.getByRole('button')).not.toHaveClass('w-full')
    })

    it('applies full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>)
      expect(screen.getByRole('button')).toHaveClass('w-full')
    })
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Button ref={ref}>With Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('passes additional HTML attributes', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })
})
