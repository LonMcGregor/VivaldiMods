I tried to figure out how sync worked, unsucesfully

generate client id and secret ahead of time, i guess?
POST oauth token
    recieves json
POST userinfo, token
    json
GET vivid-auth info
    username, auth success?

POST vivid-sync command
    these are encoded octet streams, no idea how to read them...
    are they text, encrypted aand then bytes encoded to base64?
    stuff coming back is as pplaintext

first command sent is username, ???, invalidator client ID    
first command gets back nigori, which is encryption keys

all comms sent using oauth bearer http header token
all commands sent end with th same string
