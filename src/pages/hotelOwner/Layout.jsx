import React from 'react'
import Navbar from '../../components/hotelowner/Navbar'
import Sidebar from '../../components/hotelowner/Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className='flex flex-col h-screen'>
      {/* Top Navbar */}
      <Navbar />

      {/* Body: Sidebar + Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className='flex-1 p-6 overflow-y-auto bg-gray-50'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
