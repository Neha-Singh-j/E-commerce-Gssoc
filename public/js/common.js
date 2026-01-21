// Add this at the beginning of your common.js
document.addEventListener('DOMContentLoaded', function() {
    // Apply theme to body
    document.body.style.backgroundColor = '#f8f9fa'; // Light background for content
    document.body.style.color = '#2c0b5e'; // Dark purple text for readability

    // Optionally add gradient borders to main content
    const mainContent = document.querySelector('main');
    if(mainContent) {
        mainContent.style.borderTop = '3px solid transparent';
        mainContent.style.borderImage = 'linear-gradient(to right, #6a11cb, #fc4a1a)';
        mainContent.style.borderImageSlice = '1';
        mainContent.style.borderRadius = '0 0 8px 8px';
    }
});

// Your existing like button code
let allLikeButton = document.querySelectorAll('.like-btn');

async function likeButton(productId, btn) {
    try {
        let response = await axios({
            method: 'post',
            url: `/products/${productId}/like`,
            headers: {'X-Requested-With': 'XMLHttpRequest'}
        });

        if(btn.children[0].classList.contains('fa-regular')) {
            btn.children[0].classList.remove('fa-regular');
            btn.children[0].classList.add('fa-solid');
            btn.children[0].style.color = '#fc4a1a'; // Orange color for liked state
        } else {
            btn.children[0].classList.remove('fa-solid');
            btn.children[0].classList.add('fa-regular');
            btn.children[0].style.color = '#6a11cb'; // Purple color for unliked state
        }
    }
    catch(e) {
        if(e.response.status === 401) {
            window.location.replace('/login');
            console.log(e.message, 'error hai ye window vaali line ka');
        }
    }
}

for(let btn of allLikeButton) {
    btn.addEventListener('click', () => {
        let productId = btn.getAttribute('product-id');
        likeButton(productId, btn);
    });
}

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.classList.toggle('show');
    });

    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        chatbotContainer.classList.remove('show');
    });

    // Handle quick option clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option-btn')) {
            const action = e.target.getAttribute('data-action');
            handleQuickAction(action);
        }
    });

    // Handle quick actions
    function handleQuickAction(action) {
        let response = '';
        let redirectUrl = '';

        switch(action) {
            case 'products':
                response = '💬 I can help you find products! Browse our categories or search for specific items. What are you looking for?';
                redirectUrl = '/products';
                break;
            case 'faq':
                response = '❓ Check out our FAQ section for answers to common questions about shopping, shipping, and returns.';
                redirectUrl = '/faq';
                break;
            case 'contact':
                response = '📞 Need direct help? Contact our support team through our contact form or call us directly.';
                redirectUrl = '/contact';
                break;
        }

        addMessage('bot', response);

        // Redirect after a short delay
        if (redirectUrl) {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        }
    }

    // Send message function
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatbotInput.value = '';

            // Simulate bot response
            setTimeout(() => {
                const botResponse = getBotResponse(message);
                addMessage('bot', botResponse);
            }, 1000);
        }
    }

    // Add message to chat
    function addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;

        messageDiv.appendChild(contentDiv);
        chatbotMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get bot response based on user input
    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('shop')) {
            return '🛍️ Great! You can browse our products by category or use the search feature. Check out our <a href="/products" style="color: #6a11cb;">products page</a> for amazing deals!';
        } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
            return '🚚 We offer fast shipping options! Standard delivery takes 3-5 business days, and express is available for 1-2 days. Free shipping on orders over $50.';
        } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
            return '↩️ We have a 30-day return policy for most items. Visit our <a href="/faq" style="color: #6a11cb;">FAQ page</a> for detailed return information.';
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
            return '📞 Need help? Reach out to our support team through our <a href="/contact" style="color: #6a11cb;">contact page</a> or call us at +1 (555) 987-6543.';
        } else if (lowerMessage.includes('faq') || lowerMessage.includes('question')) {
            return '❓ Find answers to common questions on our <a href="/faq" style="color: #6a11cb;">FAQ page</a>. We cover everything from ordering to returns!';
        } else {
            return '👋 Thanks for your message! For specific help, try our quick options above or visit our <a href="/contact" style="color: #6a11cb;">contact page</a> to get in touch with our support team.';
        }
    }

    // Event listeners
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
