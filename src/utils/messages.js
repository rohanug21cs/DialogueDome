// Function to generate a text message object
const generateMessage = (username, text) => {
  return {
    // Include the username, text, and the timestamp of when the message was created
    username,
    text,
    createdAt: new Date().getTime()
  };
};

// Function to generate a location message object
const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  };
};

// Export the functions to be used in other modules
module.exports = {
  generateMessage,
  generateLocationMessage
};
