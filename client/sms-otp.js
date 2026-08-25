const form =
    document.getElementById("smsOtpForm");

const message =
    document.getElementById("smsOtpMessage");


const challengeId =
    sessionStorage.getItem("smsChallengeId");


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const otp =
        document.getElementById("smsOtp").value.trim();


    // Basic validation

    if (!/^\d{6}$/.test(otp)) {

        message.textContent =
            "Please enter a valid 6-digit OTP.";

        return;

    }


    try {

        const response = await fetch(
            "/api/verify-sms-otp",
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

            if (
                data.remainingAttempts !== undefined
            ) {

                message.textContent =
                    `${data.message}. ${data.remainingAttempts} attempts remaining.`;

            } else {

                message.textContent =
                    data.message;

            }

            return;

        }


        // SMS verified

        sessionStorage.removeItem(
            "smsChallengeId"
        );

alert("Mobile verified successfully!");

sessionStorage.removeItem("smsChallengeId");

window.location.href = "registration-success.html";


        // Registration success will come here


    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

    }

});