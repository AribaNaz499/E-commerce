import React from 'react'
import Card from '../Card' // Sidebar nikal diya kyunki wo App.jsx mein hai

const Dashboard = () => {
  return (
    <div className="p-4"> 
      <h1 className="text-2xl font-bold mb-8 mt-2 text-gray-800">Dashboard Overview</h1>
      <Card />
    </div>
  )
}

export default Dashboard