import React, { useState } from 'react';
import Title from '../components/Title';
import { assets, userBookingsDummyData } from '../assets/assets';

const MyBookings = () => {
  const [bookings, setBookings] = useState(userBookingsDummyData);

  return (
    <>
      {/* Title Section */}
      <div className='pt-28 pb-10 px-4 md:px-16 lg:px-24 xl:px-32'>
        <Title 
          title='My Bookings' 
          subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks.' 
          align='left' 
        />
      </div>

      {/* Bookings Table */}
      <div className='max-w-6xl mx-auto w-full text-gray-800'>

        {/* Header Row */}
        <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
          <div className='text-left'>Hotels</div>
          <div className='text-left'>Date & Timings</div>
          <div className='text-left'>Payment</div>
        </div>

        {/* Booking Rows */}
        <div className='divide-y divide-gray-300'>
          {bookings.map((booking, index) => (
            <div
              key={booking._id}
              className='grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full py-6'
            >
              {/* Hotel Details */}
              <div className="flex md:justify-start justify-center">
                <div className='flex flex-col md:flex-row items-center md:items-start gap-4'>
                  <img
                    src={booking.room.images[0]}
                    alt="hotel-img"
                    className='w-44 rounded shadow object-cover'
                  />
                  <div className='flex flex-col gap-1.5 text-center md:text-left'>
                    <p className='font-playfair text-2xl'>
                      {booking.hotel.name}
                      <span className='font-inter text-sm'> ({booking.room.roomType})</span>
                    </p>
                    <div className='flex items-center gap-1 text-sm text-gray-500 justify-center md:justify-start'>
                      <img src={assets.locationIcon} alt="location-icon" />
                      <span>{booking.hotel.address}</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm text-gray-500 justify-center md:justify-start'>
                      <img src={assets.locationIcon} alt="location-icon" />
                      <span>Guests: {booking.guests}</span>
                    </div>
                    <p className='text-base font-medium'>Total: ${booking.totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Date & Timings */}
                <div className='flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
                  <div>
                    <p>Check-In:</p>
                    <p className='classname= "text-gray-500  text-sm"'>
                      {new Date(booking.checkInDate).toDateString()}
                    </p>
                  </div>

                  <div>
                    <p>Check-Out:</p>
                    <p className='classname= "text-gray-500  text-sm"'>
                      {new Date(booking.checkOutDate).toDateString()}
                    </p>
                  </div>

                </div>

              {/* Payment Status */}
              {/* Payment */}
<div className='flex flex-col items-start justify-center pt-3'>
  <div className='flex items-center gap-2'>
    {/* Colored dot */}
    <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
    
    {/* Payment Status Text */}
    <p className={`text-sm font-medium ${booking.isPaid ? "text-green-600" : "text-red-500"}`}>
      {booking.isPaid ? "Paid" : "Unpaid"}
    </p>
  </div>

  {/* Pay Now Button (Only if unpaid) */}
  {!booking.isPaid && (
    <button className='px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-100 transition-all cursor-pointer'>
      Pay Now
    </button>
  )}
</div>



            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default MyBookings;
