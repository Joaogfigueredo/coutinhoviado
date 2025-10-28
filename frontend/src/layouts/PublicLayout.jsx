// src/layouts/PublicLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function PublicLayout() {
  return (
    <PageTransition>
      <ThemeToggle />
      <Outlet />
    </PageTransition>
  )
}
