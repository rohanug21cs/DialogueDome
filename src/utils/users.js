const users = []; // Array to store user data

// Function to add a user to the users array
const addUser = ({ id, username, room }) => {
  // Clean the data by trimming and converting to lowercase
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!"
    };
  }

  // Check for existing user in the same room
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username uniqueness
  if (existingUser) {
    return {
      error: "Username is in use!"
    };
  }

  // Store user in the users array
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// Function to remove a user from the users array by their ID
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  // Remove the user from the array and return the removed user
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Function to get a user by their ID
const getUser = id => {
  return users.find(user => user.id === id);
};

// Function to get all users in a specific room
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

// Export the functions to be used in other modules
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
