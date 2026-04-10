import React from 'react';
import { assets, dashboardDummyData } from '../../assets/assets';
import { useState } from 'react';

const Dashboard = () => {

  const [dashboardData, setDashboardData] = useState(dashboardDummyData)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-left font-outfit">Dashboard</h1>
      <p className="text-gray-500 text-left mt-2 max-w-3xl">
        Monitor your room listings, track bookings and analyze revenue—all in one place. Stay updated with real-time insights to ensure smooth operations.
      </p>

      <div className='flex gap-4 my-8'>
        { /* TOTAL BOOKINGS */}
        <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
          <img src={assets.totalBookingIcon} alt=""  className='max-sm:hidden h-10'/>
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Bookings</p>
            <p className='text-neutral-400 text-base'>{dashboardData.totalBookings}</p>
          </div>
        </div>
        {/* TOTAL REVENUE */}
        <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
          <img src={assets.totalRevenueIcon} alt=""  className='max-sm:hidden h-10'/>
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Revenue</p>
            <p className='text-neutral-400 text-base'>$ {dashboardData.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* BOOKINGS BY MONTH */}
      <h2 className='text-xl text-blue-950/70 font-meduim mb-5'>Recent Bookings</h2>
      <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='py-3 px-4 text-gray-800 font-medium'>User Name</th>
                <th className='py-3 px-4 text-gray-800 font-medium max-sm-hidden'>Room Name</th>
                <th className='py-3 px-4 text-gray-800 font-medium text-center'>Total Amount</th>
                <th className='py-3 px-4 text-gray-800 font-medium text-center'>Payment Status</th>
              </tr>
            </thead>

            <tbody className='text-sm'>
          {dashboardData.bookings.map((item, index) => (
           <tr key={index}>
           <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{item.user.username}</td>
           <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{item.room.roomType}</td>
          <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>${item.totalPrice}</td>
          <td className='py-3 px-4 border-t border-gray-300 text-center'>
          <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            item.isPaid
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {item.isPaid ? 'Completed' : 'Pending'}
        </span>
      </td>
    </tr>
  ))}
</tbody>


          </table>
      </div>
    </div>


  );
};

export default Dashboard;
