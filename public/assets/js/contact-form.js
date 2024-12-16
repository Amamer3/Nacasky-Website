document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('optech-main-form-btn');
    const form = document.querySelector('form');
    const preloaderWrap = document.querySelector('.optech-preloader-wrap');

    const showPreloader = () => {
        preloaderWrap.style.display = 'flex'; // Show the preloader
    };

    const hidePreloader = () => {
        preloaderWrap.style.display = 'none'; // Hide the preloader
    };

    const showError = (id, message) => {
        const errorDiv = document.getElementById(id);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    };

    const hideError = (id) => {
        const errorDiv = document.getElementById(id);
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    };

    const hideAllErrors = () => {
        document.querySelectorAll('.error-message').forEach((errorDiv) => {
            errorDiv.style.display = 'none';
        });
    };

    // Attach input listeners to clear errors
    const attachInputListeners = () => {
        const fields = [
            { name: 'name', errorId: 'name-error' },
            { name: 'phone', errorId: 'phone-error' },
            { name: 'email', errorId: 'email-error' },
            { name: 'message', errorId: 'message-error' },
        ];

        fields.forEach((field) => {
            const input = document.querySelector(`[name="${field.name}"]`);
            if (input) {
                input.addEventListener('input', () => hideError(field.errorId));
            }
        });
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Hide all previous errors
        hideAllErrors();

        const name = document.querySelector('input[name="name"]').value.trim();
        const phone = document.querySelector('input[name="phone"]').value.trim();
        const email = document.querySelector('input[name="email"]').value.trim();
        const message = document.querySelector('textarea[name="message"]').value.trim();

        let valid = true;

        // Validation logic
        if (!name) {
            showError('name-error', 'Name is required.');
            valid = false;
        }

        if (!phone) {
            showError('phone-error', 'Contact is required.');
            valid = false;
        } else if (!/^\+?[0-9\s]+$/.test(phone)) {
            showError('phone-error', 'Please enter a valid phone number.');
            valid = false;
        }

        if (!email) {
            showError('email-error', 'Email address is required.');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email-error', 'Please enter a valid email address.');
            valid = false;
        }

        if (!message) {
            showError('message-error', 'Message is required.');
            valid = false;
        }

        if (!valid) return;

        // Show preloader and disable the button
        button.disabled = true;
        showPreloader();

        try {
            const response = await fetch('https://nacasky-website.vercel.app/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phone, email, message }),
            });

            if (response.ok) {
                alert('Message sent successfully!');
                form.reset(); // Clear all form fields
            } else {
                const errorData = await response.json();
                alert(`Failed to send email: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            // Hide preloader and re-enable the button
            hidePreloader();
            button.disabled = false;
        }
    });

    // Initialize input listeners to hide errors on user input
    attachInputListeners();
});
