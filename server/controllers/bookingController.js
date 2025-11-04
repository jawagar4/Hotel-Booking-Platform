import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";


// Functionality: This code is part of a hotel booking system, specifically handling room management and bookings. It includes routes for creating rooms, getting room details, and managing bookings.

const checkAvailability = async (checkInDate, checkOutDate, room) => {
    try {
        const bookings = await Booking.find({
            room,
                 checkInDate: { $lte: checkOutDate}, 
                 checkOutDate: {  $gte: checkInDate } 
               
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    }catch (error) {
        console.error(error.message);

    }
}

//API to check room availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to create a booking

export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests} = req.body;
        const user = req.user._id;

        //Before Booking, check if the room is available
        const isAvailable = await checkAvailability(checkInDate, checkOutDate, room);
        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available" });
        }

        // If available, create the booking
        const bookings = new Booking({
            room,
            checkInDate,
            checkOutDate,
            guests,
            user
        });
       if(!isAvailable) {
            return res.json({ success: false, message: "Room is not available" });
        }

        //Get total price based on room price and number of nights
        const roomData = await Room.findById(room).populate('hotel');
        let totalPrice = roomData.pricePerNight;

        //caculate total price based on number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
            isPaid: false, // Assuming payment is done at the hotel
        });
        res.json({ success: true, message: "Booking created successfully" });
    } catch (error) {

        res.json({ success: false, message: "Failed to create booking" });
    }
};

//API to get bookings by user
//GET /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate('room hotel').sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    }catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
}

export const getHotelBookings = async (req, res) => {
    try {
const hotel = await Hotel.findOne({ owner: req.auth.userId });
if (!hotel) {
    return res.json({ success: false, message: "Hotel not found" });
}
 const bookings = await Booking.find({ hotel: hotel._id }).populate('room hotel user').sort({ createdAt: -1 });
 //Total Bookings
 const totalBookings = bookings.length;
 //Total Revenue
 const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
 res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings }  });
    } catch (error) {
res.json({ success: false, message: "Failed to fetch hotel bookings" });

    }
}
