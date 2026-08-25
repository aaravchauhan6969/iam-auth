const form = document.getElementById("otpForm");

const otpMessage =
    document.getElementById("otpMessage");


const challengeId =
    sessionStorage.getItem("challengeId");


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const otp =
        document.getElementById("otp").value.trim();


    // Check OTP format

    if (!/^\d{6}$/.test(otp)) {

        otpMessage.textContent =
            "Please enter a valid 6-digit OTP.";

        return;

    }


    try {

        const response = await fetch(
            "/api/verify-email-otp",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    challengeId,
                    otp
                })

            }
        );


        const data = await response.json();


        if (!data.success) {

            if (data.remainingAttempts !== undefined) {

                otpMessage.textContent =
                    `${data.message}. ${data.remainingAttempts} attempts remaining.`;

            } else {

                otpMessage.textContent =
                    data.message;

            }

            return;

        }


        // Email successfully verified
if (!data.success) {

    if (data.remainingAttempts !== undefined) {

        otpMessage.textContent =
            `${data.message}. ${data.remainingAttempts} attempts remaining.`;

    } else {

        otpMessage.textContent =
            data.message;

    }

    return;
}


// Email verified successfully

sessionStorage.setItem(
    "smsChallengeId",
    data.challengeId
);

window.location.href = "sms-otp.html";

        // SMS OTP will come here

        console.log(
            "Email verification complete"
        );


    } catch (error) {

        console.error(error);

        otpMessage.textContent =
            "Unable to connect to server.";

    }

});