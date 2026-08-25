const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());


// Serve frontend files
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/register.html"));
});
// Temporary storage
const users = [];
const otpChallenges = [];


// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


// Hash OTP
function hashOTP(otp) {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}


// ==============================
// REGISTER
// ==============================
app.post("/api/register", async (req, res) => {

    console.log("REGISTER API HIT");
    console.log("Email:", req.body.email);

    try {

        const {
            fullName,
            email,
            mobile,
            password,
            confirmPassword
        } = req.body;


        // Check required fields

        if (
            !fullName ||
            !email ||
            !mobile ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // Check password

        if (password !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });

        }


        // Check if email already exists

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });

        }


        // Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create user

        const newUser = {

            id: users.length + 1,

            fullName,

            email,

            mobile,

            password: hashedPassword,

            emailVerified: false,

            mobileVerified: false,

            mfaEnabled: false

        };


        // Store user

        users.push(newUser);


        // ==============================
        // GENERATE EMAIL OTP
        // ==============================

        const otp = generateOTP();

        const otpHash = hashOTP(otp);

        const challenge = {

            challengeId: crypto.randomUUID(),

            userId: newUser.id,

            channel: "email",

            otpHash: otpHash,

            expiresAt: Date.now() + 5 * 60 * 1000,

            attempts: 0

        };


        // Store OTP challenge

        otpChallenges.push(challenge);


        // Simulated email

        console.log(`
========================================

[SIMULATED EMAIL]

To: ${newUser.email}

OTP: ${otp}

This OTP will expire in 5 minutes.

========================================
        `);


        console.log("New user registered:", {

            id: newUser.id,

            email: newUser.email

        });


        // Send response to frontend

        res.status(201).json({

            success: true,

            message: "Registration started successfully",

            userId: newUser.id,

            challengeId: challenge.challengeId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

});
// ==============================
// VERIFY EMAIL OTP
// ==============================

app.post("/api/verify-email-otp", (req, res) => {

    try {

        const {
            challengeId,
            otp
        } = req.body;


        // Check required data

        if (!challengeId || !otp) {

            return res.status(400).json({
                success: false,
                message: "Challenge ID and OTP are required"
            });

        }


        // Find OTP challenge

        const challenge = otpChallenges.find(
            item => item.challengeId === challengeId
        );


        if (!challenge) {

            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP challenge"
            });

        }


        // Check maximum attempts

        if (challenge.attempts >= 3) {

            return res.status(429).json({
                success: false,
                message: "Maximum attempts exceeded. Please request a new OTP."
            });

        }


        // Check expiry

        if (Date.now() > challenge.expiresAt) {

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });

        }


        // Hash entered OTP

        const enteredOtpHash = hashOTP(otp);


        // Check OTP

        if (enteredOtpHash !== challenge.otpHash) {

            challenge.attempts++;

            const remainingAttempts =
                3 - challenge.attempts;


            return res.status(400).json({

                success: false,

                message: "Incorrect OTP",

                remainingAttempts

            });

        }


        // Find user

        const user = users.find(
            user => user.id === challenge.userId
        );


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // Mark email as verified

       // Mark email as verified
user.emailVerified = true;

console.log("EMAIL OTP VERIFIED");
console.log("Generating SMS OTP...");

const smsOtp = generateOTP();

console.log("SMS OTP GENERATED:", smsOtp);

// Remove email OTP challenge
const challengeIndex = otpChallenges.indexOf(challenge);

otpChallenges.splice(challengeIndex, 1);


// Generate SMS OTP
const smsOtp = generateOTP();

const smsOtpHash = hashOTP(smsOtp);


// Create SMS challenge
const smsChallenge = {

    challengeId: crypto.randomUUID(),

    userId: user.id,

    channel: "sms",

    otpHash: smsOtpHash,

    expiresAt: Date.now() + 5 * 60 * 1000,

    attempts: 0,

    used: false

};


// Store SMS challenge
otpChallenges.push(smsChallenge);


// Simulated SMS
console.log(`
========================================

[SIMULATED SMS]

To: ${user.mobile}

OTP: ${smsOtp}

This OTP will expire in 5 minutes.

========================================
`);


// Send SMS challenge to frontend
res.json({

    success: true,

    message: "Email verified. SMS OTP sent.",

    emailVerified: true,

    smsRequired: true,

    challengeId: smsChallenge.challengeId

});


        // Successful response

        res.json({

            success: true,

            message: "Email verified successfully",

            emailVerified: true

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

});

// ==============================
// VERIFY SMS OTP
// ==============================

app.post("/api/verify-sms-otp", (req, res) => {

    try {

        const {
            challengeId,
            otp
        } = req.body;


        // Check required data

        if (!challengeId || !otp) {

            return res.status(400).json({
                success: false,
                message: "Challenge ID and OTP are required"
            });

        }


        // Find SMS challenge

        const challenge = otpChallenges.find(
            item =>
                item.challengeId === challengeId &&
                item.channel === "sms"
        );


        if (!challenge) {

            return res.status(400).json({
                success: false,
                message: "Invalid or expired SMS OTP challenge"
            });

        }


        // Check maximum attempts

        if (challenge.attempts >= 3) {

            return res.status(429).json({
                success: false,
                message: "Maximum attempts exceeded. Please request a new OTP."
            });

        }


        // Check expiry

        if (Date.now() > challenge.expiresAt) {

            return res.status(400).json({
                success: false,
                message: "SMS OTP has expired. Please request a new OTP."
            });

        }


        // Hash entered OTP

        const enteredOtpHash = hashOTP(otp);


        // Compare OTP hashes

        if (enteredOtpHash !== challenge.otpHash) {

            challenge.attempts++;

            const remainingAttempts =
                3 - challenge.attempts;


            return res.status(400).json({

                success: false,

                message: "Incorrect SMS OTP",

                remainingAttempts

            });

        }


        // Find user

        const user = users.find(
            user => user.id === challenge.userId
        );


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // Mark mobile as verified

        user.mobileVerified = true;


        // Enable MFA

        user.mfaEnabled = true;


        // Remove used challenge

        const challengeIndex =
            otpChallenges.indexOf(challenge);

        otpChallenges.splice(
            challengeIndex,
            1
        );


        // Registration complete

        res.json({

            success: true,

            message: "Mobile verified. MFA enabled.",

            mobileVerified: true,

            mfaEnabled: true

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});