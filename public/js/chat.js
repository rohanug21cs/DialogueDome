//Establish a socket connection
const socket = io();

// DOM Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Message Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Extract username and room from the URL query parameters
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Function to autoscroll the messages container
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Calculate heights and offsets of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;
  // Autoscroll if user is already at the bottom
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Event listener for incoming text messages
socket.on("message", message => {
  // Render and display the message
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// Event listener for incoming location messages
socket.on("locationMessage", message => {
  console.log(message);
  // Render and display the location message
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a")
  });

  $messages.insertAdjacentHTML("beforeend", html);
});

// Event listener for updated room data (sidebar)
socket.on("roomData", ({ room, users }) => {
  // Render and update the sidebar
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  document.querySelector("#sidebar").innerHTML = html;
});
// Event listener for form submission (text message)
$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  // Disable the send button temporarily
  $messageFormButton.setAttribute("disabled", "disabled");

  // Get the message text and emit to the server
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, error => {
    // Re-enable the send button and clear the input
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    // Handle any errors from the server
    if (error) {
      return console.log(error);
    } else {
      console.log("Message delivered!");
    }
  });
});

// Event listener for "Send Location" button click
$sendLocationBtn.addEventListener("click", () => {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  } else {
    // Disable the location button temporarily
    $sendLocationBtn.setAttribute("disabled", "disabled");

    // Get current position and emit to the server
    navigator.geolocation.getCurrentPosition(position => {
      socket.emit(
        "sendLocation",
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        error => {
          // Re-enable the location button
          $sendLocationBtn.removeAttribute("disabled");
          // Handle any errors from the server
          if (!error) {
            console.log("Location shared!");
          }
        }
      );
    });
  }
});

// Emit a "join" event to the server when the user joins a room
socket.emit("join", { username, room }, error => {
  if (error) {
    // Display an alert and redirect to the home page if there's an error
    alert(error);
    location.href = "/";
  }
});
