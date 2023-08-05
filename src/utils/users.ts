import { ChatUser} from "../types";

const users: ChatUser[] = [];
const newUser: ChatUser[] = [];

const addUser = ( usr: ChatUser) => {
    //validate data
    if (!usr.sender || !usr.room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing users
    const existingUser = users.find((user: ChatUser) => {
        return user.room == usr.room && user.sender == usr.sender && user.id == usr.id
    })

    //validate username
    if (existingUser) {
        return {
            error: "user is already in the room"
        }
    }

    //store user
    const user: ChatUser = usr
    users.push(user)
    return { user }
}

const removeUser = (id: string) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id: string) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUserInRoom = (room: string) => {
    const u = []
    users.filter((user) => {
       return user.room === room
    })
    console.log(users)
    return users
}

module.exports = {
    addUser, removeUser, getUser, getUserInRoom
}