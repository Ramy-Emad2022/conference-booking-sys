const express = require("express");
const router = express.Router();
const Conference = require("../models/Conference");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// @route    GET api/conferences
// @desc     Get all conferences (sorted by date)
// @access   Public
router.get("/", async (req, res) => {
  try {
    const conferences = await Conference.find({}).sort({ startDate: 1 });
    res.json(conferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/conferences/mybookings
// @desc     Get all bookings for the logged-in user
// @access   Private
router.get("/mybookings", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const myBookings = await Booking.find({ userId })
      .populate("conferenceId", "name location startDate endDate")
      .select("adminApprovalMessage bookingStatus");
    res.json(myBookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/conferences/bookings/pending
// @desc     Get all pending bookings for admin
// @access   Private (Admin)
router.get("/bookings/pending", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }

    const pendingBookings = await Booking.find({ bookingStatus: "pending" })
      .populate("userId", "name email churchName")
      .populate("conferenceId", "name startDate");

    res.json(pendingBookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    PUT api/conferences/bookings/approve/:bookingId
// @desc     Admin approves a booking
// @access   Private (Admin)
router.put("/bookings/approve/:bookingId", auth, async (req, res) => {
  try {
    const { approvalMessage } = req.body;

    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (booking.bookingStatus === "approved") {
      return res.status(400).json({ msg: "Booking is already approved" });
    }

    booking.bookingStatus = "approved";
    booking.adminApprovalMessage =
      approvalMessage || "Your booking has been approved!";
    await booking.save();

    res.json({ msg: "Booking approved successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/conferences
// @desc     Create a new conference (Admin only)
// @access   Private (Admin)
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }

    const { name, location, description, startDate, endDate, totalSlots } =
      req.body;

    const newConference = new Conference({
      name,
      location,
      description,
      startDate,
      endDate,
      totalSlots,
      availableSlots: totalSlots,
    });

    const conference = await newConference.save();

    res.status(201).json(conference);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/conferences/:id
// @desc     Get a single conference by ID
// @access   Public
router.get("/:id", auth, async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);

    if (!conference) {
      return res.status(404).json({ msg: "Conference not found" });
    }

    res.json(conference);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Conference not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route    PUT api/conferences/:id
// @desc     Update a conference by ID (Admin only)
// @access   Private (Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }

    const { name, location, description, startDate, endDate, totalSlots } =
      req.body;

    const conference = await Conference.findById(req.params.id);
    if (!conference) {
      return res.status(404).json({ msg: "Conference not found" });
    }

    if (name) conference.name = name;
    if (location) conference.location = location;
    if (description) conference.description = description;
    if (startDate) conference.startDate = startDate;
    if (endDate) conference.endDate = endDate;
    if (totalSlots) {
      const changeInSlots = totalSlots - conference.totalSlots;
      conference.totalSlots = totalSlots;
      conference.availableSlots += changeInSlots;
    }

    await conference.save();

    res.json({ msg: "Conference updated successfully", conference });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    DELETE api/conferences/:id
// @desc     Delete a conference by ID (Admin only)
// @access   Private (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }

    const conference = await Conference.findById(req.params.id);
    if (!conference) {
      return res.status(404).json({ msg: "Conference not found" });
    }

    await Conference.findByIdAndDelete(req.params.id);

    await Booking.deleteMany({ conferenceId: req.params.id });

    res.json({
      msg: "Conference and all related bookings deleted successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/conferences/register-conference/:conferenceId
// @desc     User registers for a conference
// @access   Private
router.post("/register-conference/:conferenceId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conferenceId = req.params.conferenceId;

    const existingBooking = await Booking.findOne({ userId, conferenceId });
    if (existingBooking) {
      return res
        .status(400)
        .json({ msg: "You have already registered for this conference." });
    }

    const conference = await Conference.findById(conferenceId);
    if (!conference || conference.availableSlots <= 0) {
      return res
        .status(400)
        .json({ msg: "No available slots for this conference." });
    }

    const newBooking = new Booking({
      userId,
      conferenceId,
      bookingStatus: "pending",
    });

    await newBooking.save();

    conference.availableSlots -= 1;
    await conference.save();

    res.status(201).json({
      msg: "Registration successful! Your booking is pending admin approval.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    PUT api/conferences/cancel-booking/:bookingId
// @desc     User cancels a booking
// @access   Private
router.put("/cancel-booking/:bookingId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.bookingId;

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res
        .status(404)
        .json({ msg: "Booking not found or does not belong to you." });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ msg: "Booking is already cancelled." });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    const conference = await Conference.findById(booking.conferenceId);
    if (conference) {
      conference.availableSlots += 1;
      await conference.save();
    }

    res.json({ msg: "Booking cancelled successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
