import React from 'react'
import Card from '../Card'
import Analytics from '../Charts';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8 mt-2 text-gray-800">Dashboard Overview</h1>
      <Card />
            <h1 className="text-2xl font-bold mb-8 mt-2 text-gray-800">Analytics</h1>
    <Analytics/>
    </div>
  )
}

export default Dashboard;