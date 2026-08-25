const form = document.getElementById("registerForm");

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const errorMessage = document.getElementById("errorMessage");


// Show / hide password

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.textContent = "🙈";

    } else {

        password.type = "password";

        togglePassword.textContent = "👁";

    }

});


// Registration form

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const fullName =
        document.getElementById("fullName").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const mobile =
        document.getElementById("mobile").value.trim();

    const passwordValue =
        password.value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const terms =
        document.getElementById("terms").checked;


    // Basic frontend validation

    if (
        !fullName ||
        !email ||
        !mobile ||
        !passwordValue ||
        !confirmPassword
    ) {

        errorMessage.textContent =
            "Please fill all the fields.";

        return;
    }


    // Check password

    if (passwordValue !== confirmPassword) {

        errorMessage.textContent =
            "Passwords do not match.";

        return;
    }


    // Check terms

    if (!terms) {

        errorMessage.textContent =
            "Please accept the Terms and Conditions.";

        return;
    }


    // Send data to backend

    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                fullName,

                email,

                mobile,

                password: passwordValue,

                confirmPassword

            })

        });


        const data = await response.json();


        if (!data.success) {

            errorMessage.textContent =
                data.message;

            return;
        }


        alert("Registration started successfully!");

        console.log("User ID:", data.userId);


        // Email OTP will come here later
        sessionStorage.setItem(
    "challengeId",
    data.challengeId
);

window.location.href = "email-otp.html";

    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            "Unable to connect to server.";

    }

});