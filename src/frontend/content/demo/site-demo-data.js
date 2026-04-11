import {
  facilityIcons,
  offerImages,
  roomImageGallery,
  siteAssets,
} from "../../assets";
import { slugify } from "../../lib/format";

export const featuredCities = [
  "New York",
  "Singapore",
  "Dubai",
  "London",
];

export const exclusiveOffers = [
  {
    _id: 1,
    title: "Early Escape Rate",
    description:
      "Lock in your plans 30 days ahead and enjoy breakfast plus up to 25% savings.",
    note: "Best for early planners who want simple value before peak dates fill up.",
    priceOff: 25,
    expiryDate: "May 31",
    image: offerImages.exclusiveOfferCardImg1,
  },
  {
    _id: 2,
    title: "Weekend City Break",
    description:
      "Two-night stays with late checkout and a welcome amenity for couples or friends.",
    note: "Built for quick city resets with fewer decisions and more convenience included.",
    priceOff: 20,
    expiryDate: "Jun 15",
    image: offerImages.exclusiveOfferCardImg2,
  },
  {
    _id: 3,
    title: "Longer Stay, Better Value",
    description:
      "Stay four nights or more and unlock premium rates across our most-booked rooms.",
    note: "A stronger fit for longer work trips, flexible itineraries, and slower stays.",
    priceOff: 30,
    expiryDate: "Jun 28",
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
      "QuickStay made it easy to compare rooms, check the details that mattered, and send a request without jumping through hoops.",
  },
  {
    id: 2,
    name: "Liam Johnson",
    address: "New York, USA",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    rating: 5,
    review:
      "The layout feels clean, the prices are clear, and the rooms looked exactly like the photos when I arrived.",
  },
  {
    id: 3,
    name: "Sophia Lee",
    address: "Seoul, South Korea",
    image:
      "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=200",
    rating: 5,
    review:
      "I loved how fast the inquiry flow was. It felt polished on mobile and gave me confidence before I booked.",
  },
];

export const roomHighlights = [
  {
    icon: siteAssets.homeIcon,
    title: "Comfort-first rooms",
    description:
      "Thoughtfully arranged spaces with the essentials guests actually notice.",
  },
  {
    icon: siteAssets.badgeIcon,
    title: "Clear pricing",
    description:
      "Nightly rates, amenities, and room types are easy to scan before you commit.",
  },
  {
    icon: siteAssets.locationFilledIcon,
    title: "Strong locations",
    description:
      "Stay close to neighborhoods, dining, and business hubs without the guesswork.",
  },
  {
    icon: siteAssets.heartIcon,
    title: "Smooth check-in flow",
    description:
      "Send a request quickly and continue the conversation with confidence afterward.",
  },
];

export const currentUser = {
  _id: "user_owner_demo_01",
  username: "mayarao",
  fullName: "Maya Rao",
  email: "maya.rao@example.com",
  image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6",
  role: "owner",
  createdAt: "2025-03-25T09:29:16.367Z",
  updatedAt: "2025-04-10T06:34:48.719Z",
  __v: 1,
  recentSearchedCities: ["New York", "Singapore"],
};

export const hotelRecord = {
  _id: "67f76393197ac559e4089b72",
  name: "Harborlight Suites",
  slug: "harborlight-suites",
  address: "125 Hudson Lane, SoHo, New York",
  contact: "+1 (212) 555-0186",
  owner: currentUser,
  city: "New York",
  createdAt: "2025-04-10T06:22:11.663Z",
  updatedAt: "2025-04-10T06:22:11.663Z",
  __v: 0,
};

const roomSeeds = [
  {
    _id: "67f7647c197ac559e4089b96",
    roomType: "Luxury Room",
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
    amenities: ["Room Service", "Free WiFi", "Pool Access"],
    images: [
      roomImageGallery.roomImg2,
      roomImageGallery.roomImg3,
      roomImageGallery.roomImg4,
      roomImageGallery.roomImg1,
    ],
  },
  {
    _id: "67f76406197ac559e4089b82",
    roomType: "Family Suite",
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
