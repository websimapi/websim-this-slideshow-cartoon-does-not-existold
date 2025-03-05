// Initialize WebSocket connection
const room = new WebsimSocket();

// Set up event handlers
room.onmessage = (event) => {
    const data = event.data;
    switch (data.type) {
        case "connected":
            console.log(`Client ${data.clientId}, ${data.username} connected`);
            break;
        case "disconnected":
            console.log(`Client ${data.clientId}, ${data.username} disconnected`);
            break;
        case "slideshow_start":
            window.dispatchEvent(new CustomEvent('slideshow_start', { detail: data }));
            break;
        case "slideshow_stop":
            window.dispatchEvent(new CustomEvent('slideshow_stop'));
            break;
        case "slideshow_next":
            window.dispatchEvent(new CustomEvent('slideshow_next'));
            break;
        default:
            console.log("Received event:", data);
    }
};

// Define collection helpers
const getCartoons = () => room.collection('cartoon').getList();
const subscribeToCartoons = (callback) => room.collection('cartoon').subscribe(callback);
const createCartoon = async (data) => await room.collection('cartoon').create(data);

const startSlideshow = () => {
    room.send({
        type: "slideshow_start",
        echo: true,
        cartoons: getCartoons()
    });
};

const stopSlideshow = () => {
    room.send({
        type: "slideshow_stop",
        echo: true
    });
};

const nextSlide = () => {
    room.send({
        type: "slideshow_next",
        echo: true
    });
};

