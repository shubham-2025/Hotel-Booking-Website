import {
  facilityIcons,
  offerImages,
  roomImageGallery,
  siteAssets,
} from "../../assets";
import { slugify } from "../../lib/format";

export const featuredCities = ["Dubai", "Singapore", "New York", "London"];

export const exclusiveOffers = [
  {
    _id: 1,
    title: "Summer Escape Package",
    description: "Enjoy a complimentary night and daily breakfast",
    priceOff: 25,
    expiryDate: "Aug 31",
    image: offerImages.exclusiveOfferCardImg1,
  },
  {
    _id: 2,
    title: "Romantic Getaway",
    description: "Special couples package including spa treatment",
    priceOff: 20,
    expiryDate: "Sep 20",
    image: offerImages.exclusiveOfferCardImg2,
  },
  {
    _id: 3,
    title: "Luxury Retreat",
    description:
      "Book 60 days in advance and save on your stay at any of our luxury properties worldwide.",
    priceOff: 30,
    expiryDate: "Sep 25",
    image: offerImages.exclusiveOfferCardImg3,
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Emma Rodriguez",
    address: "Barcelona, Spain",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    rating: 5,
    review:
      "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides.",
  },
  {
    id: 2,
    name: "Liam Johnson",
    address: "New York, USA",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    rating: 4,
    review:
      "QuickStay exceeded my expectations. The booking process was seamless, and the hotels were absolutely top-notch. Highly recommended!",
  },
  {
    id: 3,
    name: "Sophia Lee",
    address: "Seoul, South Korea",
    image:
      "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=200",
    rating: 5,
    review:
      "Amazing service! I always find the best luxury accommodations through QuickStay. Their recommendations never disappoint!",
  },
];

export const roomHighlights = [
  {
    icon: siteAssets.homeIcon,
    title: "Clean & Safe Stay",
    description: "A well-maintained and hygienic space just for you.",
  },
  {
    icon: siteAssets.badgeIcon,
    title: "Enhanced Cleaning",
    description: "This host follows Staybnb's strict cleaning standards.",
  },
  {
    icon: siteAssets.locationFilledIcon,
    title: "Excellent Location",
    description: "90% of guests rated the location 5 stars.",
  },
  {
    icon: siteAssets.heartIcon,
    title: "Smooth Check-In",
    description: "100% of guests gave check-in a 5-star rating.",
  },
];

export const currentUser = {
  _id: "user_2unqyL4diJFP1E3pIBnasc7w8hP",
  username: "Great Stack",
  fullName: "Great Stack",
  email: "user.greatstack@gmail.com",
  image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6",
  role: "hotelOwner",
  createdAt: "2025-03-25T09:29:16.367Z",
  updatedAt: "2025-04-10T06:34:48.719Z",
  __v: 1,
  recentSearchedCities: ["New York"],
};

export const hotelRecord = {
  _id: "67f76393197ac559e4089b72",
  name: "Urbanza Suites",
  slug: "urbanza-suites",
  address: "Main Road  123 Street , 23 Colony",
  contact: "+0123456789",
  owner: currentUser,
  city: "New York",
  createdAt: "2025-04-10T06:22:11.663Z",
  updatedAt: "2025-04-10T06:22:11.663Z",
  __v: 0,
};

const roomSeeds = [
  {
    _id: "67f7647c197ac559e4089b96",
    roomType: "Double Bed",
    pricePerNight: 399,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [
      roomImageGallery.roomImg1,
      roomImageGallery.roomImg2,
      roomImageGallery.roomImg3,
      roomImageGallery.roomImg4,
    ],
  },
  {
    _id: "67f76452197ac559e4089b8e",
    roomType: "Double Bed",
    pricePerNight: 299,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [
      roomImageGallery.roomImg2,
      roomImageGallery.roomImg3,
      roomImageGallery.roomImg4,
      roomImageGallery.roomImg1,
    ],
  },
  {
    _id: "67f76406197ac559e4089b82",
    roomType: "Double Bed",
    pricePerNight: 249,
    amenities: ["Free WiFi", "Free Breakfast", "Room Service"],
    images: [
      roomImageGallery.roomImg3,
      roomImageGallery.roomImg4,
      roomImageGallery.roomImg1,
      roomImageGallery.roomImg2,
    ],
  },
  {
    _id: "67f763d8197ac559e4089b7a",
    roomType: "Single Bed",
    pricePerNight: 199,
    amenities: ["Free WiFi", "Room Service", "Pool Access"],
    images: [
      roomImageGallery.roomImg4,
      roomImageGallery.roomImg1,
      roomImageGallery.roomImg2,
      roomImageGallery.roomImg3,
    ],
  },
];

export const rooms = roomSeeds.map((room) => ({
  ...room,
  hotel: {
    ...hotelRecord,
    owner: {
      ...hotelRecord.owner,
    },
  },
  slug: slugify(`${hotelRecord.name}-${room.roomType}-${room._id.slice(-4)}`),
  isAvailable: true,
  createdAt: "2025-04-10T06:26:04.013Z",
  updatedAt: "2025-04-10T06:26:04.013Z",
  __v: 0,
}));

const roomLookup = new Map(rooms.map((room) => [room._id, room]));

export const bookings = [
  {
    _id: "67f76839994a731e97d3b8ce",
    user: currentUser,
    room: roomLookup.get("67f76452197ac559e4089b8e"),
    hotel: hotelRecord,
    checkInDate: "2025-04-30T00:00:00.000Z",
    checkOutDate: "2025-05-01T00:00:00.000Z",
    totalPrice: 299,
    guests: 1,
    status: "pending",
    paymentMethod: "Stripe",
    isPaid: true,
    createdAt: "2025-04-10T06:42:01.529Z",
    updatedAt: "2025-04-10T06:43:54.520Z",
    __v: 0,
  },
  {
    _id: "67f76829994a731e97d3b8c3",
    user: currentUser,
    room: roomLookup.get("67f7647c197ac559e4089b96"),
    hotel: hotelRecord,
    checkInDate: "2025-04-27T00:00:00.000Z",
    checkOutDate: "2025-04-28T00:00:00.000Z",
    totalPrice: 399,
    guests: 1,
    status: "pending",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
    createdAt: "2025-04-10T06:41:45.873Z",
    updatedAt: "2025-04-10T06:41:45.873Z",
    __v: 0,
  },
  {
    _id: "67f76810994a731e97d3b8b4",
    user: currentUser,
    room: roomLookup.get("67f763d8197ac559e4089b7a"),
    hotel: hotelRecord,
    checkInDate: "2025-04-11T00:00:00.000Z",
    checkOutDate: "2025-04-12T00:00:00.000Z",
    totalPrice: 199,
    guests: 1,
    status: "pending",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
    createdAt: "2025-04-10T06:41:20.501Z",
    updatedAt: "2025-04-10T06:41:20.501Z",
    __v: 0,
  },
];

export { facilityIcons };
