import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('renders the counter button with initial value', () => {
    render(<App />)
    expect(screen.getByText('Count is 0')).toBeInTheDocument()
  })

  it('increments counter when button is clicked', () => {
    render(<App />)
    
    const button = screen.getByText('Count is 0')
    fireEvent.click(button)
    
    expect(screen.getByText('Count is 1')).toBeInTheDocument()
  })
})
