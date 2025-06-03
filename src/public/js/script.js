const cuteButton = document.getElementById('cute-button');
const cuteMessage = document.getElementById('cute-message');

const messages = [
    "You're adorable!",
    "Have a wonderful day!",
    "You're as sweet as candy!",
    "Stay pawsitive!",
    "You're berry special!",
    "Be kind to yourself today!"
];

const emojis = ["🐻", "🐶", "🐱", "🍓", "🌈", "🍪", "🌸", "🧁"];

cuteButton.addEventListener('click', () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    cuteMessage.innerHTML = `${randomMessage} ${randomEmoji}`;
    
    // Add a little animation
    cuteMessage.style.transform = 'scale(1.1)';
    setTimeout(() => {
        cuteMessage.style.transform = 'scale(1)';
    }, 300);
});