import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '../Navigation'

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

describe('Navigation Mobile Functionality', () => {
  describe('Mobile hamburger menu', () => {
    it('should show hamburger button on mobile and toggle menu', () => {
      render(<Navigation variant="public" />)

      // Hamburger button should be present (hidden on desktop, visible on mobile)
      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')
      expect(hamburgerButton).toBeInTheDocument()

      // Mobile menu container should not be visible initially (no mobile menu content)
      const mobileMenuContainer = hamburgerButton.closest('nav')?.querySelector('.md\\:hidden .flex-col')
      expect(mobileMenuContainer).not.toBeInTheDocument()

      // Click hamburger to open menu
      fireEvent.click(hamburgerButton)

      // Mobile menu should now be visible
      const openMobileMenu = hamburgerButton.closest('nav')?.querySelector('.md\\:hidden .flex-col')
      expect(openMobileMenu).toBeInTheDocument()

      // Check that mobile-specific menu items are present with mobile styling
      const mobileSignIn = screen.getAllByText('Sign In').find(el =>
        el.classList.contains('py-3') && el.classList.contains('text-base')
      )
      expect(mobileSignIn).toBeInTheDocument()
    })

    it('should close mobile menu when menu item is clicked', () => {
      render(<Navigation variant="public" />)

      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')

      // Open menu
      fireEvent.click(hamburgerButton)
      const openMobileMenu = hamburgerButton.closest('nav')?.querySelector('.md\\:hidden .flex-col')
      expect(openMobileMenu).toBeInTheDocument()

      // Click mobile menu item (the one with mobile styling)
      const mobileSignIn = screen.getAllByText('Sign In').find(el =>
        el.classList.contains('py-3') && el.classList.contains('text-base')
      )
      expect(mobileSignIn).toBeInTheDocument()
      fireEvent.click(mobileSignIn!)

      // Mobile menu should be closed (mobile menu container not visible)
      const closedMobileMenu = hamburgerButton.closest('nav')?.querySelector('.md\\:hidden .flex-col')
      expect(closedMobileMenu).not.toBeInTheDocument()
    })

    it('should show authenticated menu items when authenticated', () => {
      render(<Navigation variant="authenticated" />)

      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(hamburgerButton)

      // Should show authenticated menu items
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Browse Dogs')).toBeInTheDocument()
      expect(screen.getByText('Add Dog')).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()

      // Should not show public menu items
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
    })

    it('should have proper mobile touch target sizes', () => {
      render(<Navigation variant="authenticated" />)

      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(hamburgerButton)

      // Check that mobile menu items have proper styling classes for touch targets
      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink).toHaveClass('py-3') // 12px padding for good touch targets
      expect(dashboardLink).toHaveClass('text-base') // 16px font size for readability
    })

    it('should handle logout button click', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      render(<Navigation variant="authenticated" />)

      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(hamburgerButton)

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      // Should log logout action (temporary implementation)
      expect(consoleSpy).toHaveBeenCalledWith('Logout clicked')

      // Menu should close after logout click
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should toggle hamburger icon between menu and close states', () => {
      render(<Navigation variant="public" />)

      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')
      const svg = hamburgerButton.querySelector('svg')

      // Initially should show hamburger lines (menu icon)
      expect(svg?.querySelector('path[d="M4 6h16M4 12h16M4 18h16"]')).toBeInTheDocument()

      // Click to open
      fireEvent.click(hamburgerButton)

      // Should now show X icon (close icon)
      expect(svg?.querySelector('path[d="M6 18L18 6M6 6l12 12"]')).toBeInTheDocument()

      // Click to close
      fireEvent.click(hamburgerButton)

      // Should show hamburger lines again
      expect(svg?.querySelector('path[d="M4 6h16M4 12h16M4 18h16"]')).toBeInTheDocument()
    })
  })

  describe('Desktop navigation', () => {
    it('should not show mobile menu on desktop', () => {
      render(<Navigation variant="public" />)

      // Desktop navigation should be present
      const desktopNav = screen.getByText('Sign In').closest('.hidden.md\\:flex')
      expect(desktopNav).toBeInTheDocument()

      // Mobile menu container should have md:hidden class
      const hamburgerButton = screen.getByLabelText('Toggle mobile menu')
      expect(hamburgerButton.closest('.md\\:hidden')).toBeInTheDocument()
    })
  })
})