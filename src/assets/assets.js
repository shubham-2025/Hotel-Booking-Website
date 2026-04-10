import { siteAssets, facilityIcons } from "../frontend/assets";
import {
  bookings,
  currentUser,
  exclusiveOffers,
  featuredCities,
  hotelRecord,
  roomHighlights,
  rooms,
  testimonials,
} from "../frontend/content/demo/site-demo-data";
import { dashboardSnapshot } from "../frontend/content/demo/owner-demo-data";

export const assets = siteAssets;
export const cities = featuredCities;
export const roomCommonData = roomHighlights;
export const userDummyData = currentUser;
export const hotelDummyData = hotelRecord;
export const roomsDummyData = rooms;
export const userBookingsDummyData = bookings;
export const dashboardDummyData = dashboardSnapshot;

export { exclusiveOffers, testimonials, facilityIcons };
