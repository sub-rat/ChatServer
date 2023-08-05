# CHAT SERVER
https://chat.callsewa.com

https://chat.callsewa.com/swagger

This is a live chat service module which can be used in any projects.

## Features
- one-to-one chat
- group chat
- integrated with any system with their system generated token
- mobile application can use chat service with their own token
- your server has to communicate with chat server for users and chat rooms

## Technology
- NodeJs 
- Typescript
- Postgres
- Socket.io

### How to use?
Steps:
1. Need to Register Your application in chat server along with the token verification url.
2. You will get login credentials by which you can always retrive application id  and rest as well
3. With application id you have to first register the user along with token each time the token is issued in your system.
4. you have to create room and assign the users in the room
5. After this you can follow the event documentation mentioned below for chatting
Happy chatting!!
   
For socket connection
```https://chat.callsewa.com?token=xxxx```


## How to Start?
 For development

 ```
 npm run dev
 ```
 
For Production 

```
    npm run build
    npm run prod
```

To generate swagger

Live swagger URL https://chat.callsewa.com/swagger/

```
    tsoa swagger
```

tsoa manual
```shell
Usage: tsoa <command> [options]

Commands:
  tsoa spec                Generate OpenAPI spec
  tsoa swagger             Generate OpenAPI spec
  tsoa routes              Generate routes
  tsoa spec-and-routes     Generate OpenAPI spec and routes
  tsoa swagger-and-routes  Generate OpenAPI spec and routes

Options:
  --version   Show version number                                      [boolean]
  --help, -h  Show help                                                [boolean]

Not enough non-option arguments: got 0, need at least 1

```

## CHAT EVENTS

EMITTERS
```
EVENT           ARGUMENT        ARGUMEN_TYPE    EXAMPLE
join            room            string          "usr-1-2"
typing          typing          boolean         true
seen            -               -               -
send_message    message         string          "Hey, you there"
load_more       pagination      JSON            {"page":1,"limit":20} (default limt is 20 is not passed)
```

LISTENERS
<div style="color: red">NOTE: ALL message are base64 encoded</div>

```
EVENT           DATAFORMAT
message         {
                  "id": 4,
                  "roomId": 1,
                  "message": "aGVsbG8gc3VtaXQ=",
                  "userId": 2,
                  "updatedAt": "2021-07-17T12:25:59.456Z",
                  "createdAt": "2021-07-17T12:25:59.456Z",
                  "deletedAt": null
                }
                
                
info            You have joind the room


roomData        {
                  "room": "usr-1-2",
                  "users": [
                    {
                      "appId": 1,
                      "room": "usr-1-2",
                      "roomId": 1,
                      "sender": 2,
                      "id": "ZhwmPqfR7Ydk13yvAAAB"
                    },
                    {
                      "appId": 1,
                      "room": "usr-1-2",
                      "roomId": 1,
                      "sender": 1,
                      "id": "qtMUA1t_3BHHsb9rAAAD"
                    }
                  ]
                }
                
                
is_typing       {
                  "data": {
                    "id": 2,
                    "firstName": "use-1",
                    "appUserId": 2,
                    "lastName": "usr-1",
                    "middleName": null,
                    "token": "xyzbhgdkfjke",
                    "createdAt": "2021-07-15T05:14:12.117Z",
                    "updatedAt": "2021-07-15T05:14:12.117Z",
                    "deletedAt": null
                  },
                  "typing": "true"
                }
                
load_more       [
                  {
                    "id": 4,
                    "message": "aGVsbG8gc3VtaXQ=",
                    "userId": 2,
                    "createdAt": "2021-07-17T12:25:59.456Z",
                    "updatedAt": "2021-07-17T12:25:59.456Z"
                  },
                  {
                    "id": 3,
                    "message": "aGVsbG8=",
                    "userId": 1,
                    "createdAt": "2021-07-17T12:04:47.927Z",
                    "updatedAt": "2021-07-17T12:04:47.927Z"
                  },
                  {
                    "id": 2,
                    "message": "aGVsbG8=",
                    "userId": 2,
                    "createdAt": "2021-07-15T05:59:20.575Z",
                    "updatedAt": "2021-07-15T05:59:20.575Z"
                  },
                  {
                    "id": 1,
                    "message": "aGk=",
                    "userId": 1,
                    "createdAt": "2021-07-15T05:58:49.356Z",
                    "updatedAt": "2021-07-15T05:58:49.356Z"
                  }
                ]
                
room_info     

seen_by
```

## REST API for SERVER ( for Detail about integration look the swagger )
https://chat.callsewa.com/swagger/
### App ( Authentication Required)
```
POST        ​/app
GET         ​/app
DELETE      ​/app​/{appId}
```
### auth
```
POST        ​/auth​/login
Login user
POST        ​/auth​/register    ( Authentication Required)
Register user
GET         ​/auth​/verify
```
### room 
```
POST        ​/room
GET         ​/room
GET         ​/room​/{room}
PUT         ​/room​/add
PUT         ​/room​/remove
DELETE      ​/room​/{id}
```
### user
```
POST        ​/user
GET         ​/user​/{appId}
DELETE      ​/user​/{id}
```