import { bookings } from "./site-demo-data";

export const dashboardSnapshot = {
  totalBookings: bookings.length,
  totalRevenue: bookings.reduce(
    (runningTotal, booking) => runningTotal + booking.totalPrice,
    0,
  ),
  bookings,
};
