const crypto = require("crypto");
const { generateToken } = require("../services/agoraService");
const { pool } = require("../config/db");

const generateAgoraToken = async (req, res) => {
    try {
        const { booking_id } = req.body;

        if (!booking_id) {
            return res.status(400).json({
                success: false,
                error: "booking_id is required",
            });
        }

        const result = await pool.query(
            `
      SELECT
        id,
        user_id,
        expert_id,
        mode,
        payment,
        status
      FROM bookings
      WHERE id = $1
      LIMIT 1
      `,
            [booking_id]
        );

        const booking = result.rows[0];

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }

        const currentUserId = req.user?.id;

        const isUser =
            currentUserId &&
            Number(currentUserId) === Number(booking.user_id);

        const isExpert =
            currentUserId &&
            Number(currentUserId) === Number(booking.expert_id);

        if (!isUser && !isExpert) {
            return res.status(403).json({
                success: false,
                error: "You are not part of this consultation",
            });
        }

        if (booking.payment !== "Paid") {
            return res.status(400).json({
                success: false,
                error: "Payment is not completed",
            });
        }

        if (booking.status !== "upcoming") {
            return res.status(400).json({
                success: false,
                error: "Consultation is not available",
            });
        }

        const uid = crypto.randomInt(1, 2147483647);
        const channelName = `booking_${booking_id}`;
        const token = generateToken(channelName, uid);

        return res.status(200).json({
            success: true,
            data: {
                token,
                appId: process.env.AGORA_APP_ID,
                channelName,
                uid,
            },
        });
    } catch (error) {
        console.error("Agora token error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to generate Agora token",
        });
    }
};

module.exports = {
    generateToken: generateAgoraToken,
};