import heroImageAsset from "@/src/assets/heroImage.png";
import {
  assets as rawAssets,
  cities,
  dashboardDummyData,
  exclusiveOffers as rawExclusiveOffers,
  roomCommonData as rawRoomCommonData,
  roomsDummyData,
  testimonials as rawTestimonials,
  userBookingsDummyData,
  userDummyData,
} from "@/src/assets/assets";
import { assetToUrl } from "./asset";
import { slugify } from "./format";

export const siteAssets = Object.fromEntries(
  Object.entries(rawAssets).map(([key, value]) => [key, assetToUrl(value)]),
);

export const heroImage = assetToUrl(heroImageAsset);

export const featuredCities = cities;

export const exclusiveOffers = rawExclusiveOffers.map((item) => ({
  ...item,
  image: assetToUrl(item.image),
}));

export const testimonials = rawTestimonials.map((item) => ({
  ...item,
}));

export const roomHighlights = rawRoomCommonData.map((item) => ({
  ...item,
  icon: assetToUrl(item.icon),
}));

export const currentUser = {
  ...userDummyData,
  fullName: userDummyData.username,
};

export const rooms = roomsDummyData.map((room) => ({
  ...room,
  slug: slugify(`${room.hotel.name}-${room.roomType}-${room._id.slice(-4)}`),
  hotel: {
    ...room.hotel,
    slug: slugify(room.hotel.name),
    owner: {
      ...room.hotel.owner,
      image: room.hotel.owner.image,
    },
  },
  images: room.images.map(assetToUrl),
}));

const roomLookup = new Map(rooms.map((room) => [room._id, room]));

export const bookings = userBookingsDummyData.map((booking) => ({
  ...booking,
  room: roomLookup.get(booking.room._id) || {
    ...booking.room,
    images: booking.room.images.map(assetToUrl),
  },
}));

export const dashboardSnapshot = {
  ...dashboardDummyData,
  bookings,
};

export const ownerNavigation = [
  {
    label: "Dashboard",
    href: "/owner",
    description: "KPIs, revenue and recent booking activity",
  },
  {
    label: "Add Room",
    href: "/owner/add-room",
    description: "Create listing forms and storage upload flow",
  },
  {
    label: "List Room",
    href: "/owner/list-room",
    description: "Review inventory and activation status",
  },
];
