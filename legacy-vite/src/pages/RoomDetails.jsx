import React from 'react'
import { useParams } from 'react-router-dom'
import { facilityIcons, roomCommonData, roomsDummyData } from '../assets/assets'
import { useEffect, useState } from 'react'
import StarRating from '../components/StarRating'
import {assets} from '../assets/assets'

const RoomDetails = () => {
    const { id } = useParams()
    const [room, setRoom] = useState(null)  // Initialize room state to null
    const [ mainImage, setmainImage] = useState(null)  // Initialize loading state to true       


    useEffect(() => {       
       const room = roomsDummyData.find(room => room._id === id)
        room && setRoom(room)  // Set room state if room is found
        room && setmainImage(room.images[0])  // Set main image state to the first image of the room

    }, [])  // Run effect when id changes
  return  room && (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        {/* Room details header */}
        <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
            <h1 className='text-3xl md:text-4xl font-playfair'>
                {room.hotel.name}<span className='font-inter text-sm'>({room.roomType})</span></h1>
            <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% OFF</p>
        </div>
        {/* Room rating */}
        <div className='flex items-center gap-1 mt-2'>
            <StarRating/>
            <p className='ml-2'>200+ Reviews</p>
        </div>

        {/* Room address */}
        <div className='flex items-center gap-1 text-gray-500 mt-2'>
            <img src={assets.locationIcon} alt="location-icon" />
            <span>{room.hotel.address}</span>
        </div>

        {/* Room images */}
        <div className='flex flex-col lg:flex-row gap-6 mt-6'>
            <div className='lg:w-1/2 w-full '> 
                <img src={mainImage} alt="Room Image" 
                className='w-full rounded-xl shadow-lg object-cover' />
            </div>

            <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
                {room?.images.length > 1 && room.images.map((image,index)=>(
                    <img onClick={() => setmainImage(image)}
                    key={index} src={image} alt="Room Image" 
                    className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 'outline-3 outline-orange-500'}`}/>
                ))}
            </div>
        </div>

        {/* Room description /highlights*/}
        <div className='flex flex-col md:flex-row md:justify-between mt-10'>
            <div className='flex flex-col '>
                <h1 className='text-3xl md:text-4xl font-playfair'>
                    Experience Luxury like never Before
                </h1>
                <div className='flex  flex-wrap items-center gap-4 mt-3 mb-6'>
                    {room.amenities.map((item, index) => (
                        <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100' >
                            <img src={facilityIcons[item]} alt={item} 
                            className='w-5 h-5'/>
                            <p className='text-xs'>{item}</p>
                        </div>
                        ))}   
                </div>
            </div>
            {/* Room price */}
            <p className='text-2xl font-medium'>${room.pricePerNight}/night</p>
        </div>

            {/* check in chek out form */}
            <form className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>

                <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>

                    <div className='flex flex-col'>
                        <label htmlFor="CheckInDate" className='font-medium'>Check-In</label>
                        <input type="date" id='checkInDate' placeholder='Check-In'
                        className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                    </div>

                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>

                    <div className='flex flex-col'>
                        <label htmlFor="CheckOutDate" className='font-medium'>Check-Out</label>
                        <input type="date" id='checkOutDate' placeholder='Check-Out'
                        className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>     
                    </div>

                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>

                    <div className='flex flex-col'>
                        <label htmlFor="Guests" className='font-medium'>Guests</label>
                        <input type="number" id='checkInDate' placeholder='0'
                        className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                        
                    </div>


                </div>
                <button type='submit'className= 'bg-black hover:bg-gray-800 active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'>
                    Check Availability
                </button>
            </form>

            {/* common specification */}
            <div className='mt-25 space-y-4'>
                {roomCommonData.map((spec, index) => (
                    <div key={index} className='flex items-start gap-2'>
                        <img src={spec.icon} alt={`${spec.title}-icon`}className='w-6.5'/>
                        <div>
                            <p className='text-base'>{spec.title}</p>
                            <p className='text-gray-500'>{spec.description}</p>
                        </div>
                     </div>
               ))} 
            </div>

            <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
                <p>Guests will be allocated on the ground floor according to Availability.
                    You get a compfortable Two bed room with a balcony and a private bathroom.
                    The room is equipped with a flat-screen TV, a mini fridge, and a kettle.
                    The bathroom has a shower and free toiletries. The room is air-conditioned and has a seating area with a sofa.
                    The hotel offers free Wi-Fi and parking. Guests can enjoy a buffet breakfast at the hotel restaurant.
                    The hotel also has a fitness center and a spa. The hotel is located near the beach and the city center.
                </p>
            </div>

            {/* Hosted details */}
            <div className='flex flex-col items-start gap-4'>
                <div className='flex gap-4'>
                    <img src={room.hotel.owner.image} alt="Host"className='h-14 w-14 md:h-18 md:w-18 rounded-full' />
                    <div>
                        <p className='text-lg md:text-xl'>Hosted By {room.hotel.name}</p>
                        <div className='flex items-center mt-1'>
                            <startRating/>  
                            <p className='ml-2'>200+ Reviews</p>
                        </div>
                    </div>
                </div>
                <button className='bg-black hover:bg-gray-800 active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer mt-4'>Contact Now </button>
            </div>

    </div>
  )
}

export default RoomDetails
