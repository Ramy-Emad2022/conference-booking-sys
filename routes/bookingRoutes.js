// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const Conference = require("../models/Conference");
// const Booking = require("../models/Booking");

// // @route   POST api/bookings/book/:conferenceId
// // @desc    Book a spot in a conference
// // @access  Private
// router.post("/book/:conferenceId", auth, async (req, res) => {
//   try {
//     const conference = await Conference.findById(req.params.conferenceId);
//     if (!conference) {
//       return res.status(404).json({ msg: "Conference not found" });
//     }

//     const booking = new Booking({
//       user: req.user.id,
//       conference: req.params.conferenceId,
//       status: "pending",
//     });

//     await booking.save();
//     res.json({ msg: "Booking successful! Waiting for admin approval." });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// // @route   GET api/bookings/status/:conferenceId
// // @desc    Get booking status for a specific user and conference
// // @access  Private
// router.get("/status/:conferenceId", auth, async (req, res) => {
//   try {
//     const booking = await Booking.findOne({
//       user: req.user.id,
//       conference: req.params.conferenceId,
//     });

//     if (!booking) {
//       return res.json({ status: null });
//     }

//     res.json({ status: booking.status });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// // @route   DELETE api/bookings/cancel/:conferenceId
// // @desc    Cancel a booking
// // @access  Private
// router.delete("/cancel/:conferenceId", auth, async (req, res) => {
//   try {
//     const booking = await Booking.findOneAndRemove({
//       user: req.user.id,
//       conference: req.params.conferenceId,
//     });

//     if (!booking) {
//       return res.status(404).json({ msg: "Booking not found" });
//     }

//     res.json({ msg: "Booking canceled successfully" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;
