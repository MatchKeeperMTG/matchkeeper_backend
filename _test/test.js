import assert from "assert";

function api(endpoint) {
    return `http://localhost:8080/api${endpoint}`
}

var token = undefined;

async function req(endpoint, method, body) {
    return fetch(api(endpoint), {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    }).then(res => res.json());
}

async function getAuth() {
    // login
    let authResponse = await req("/user/login", "POST", {username: "aria", password: "pwd123"});

    assert(authResponse.token);

    token = authResponse.token;
}

async function createEvent() {
    let eventRes = await req("/event", "POST", {
        eventName: "test.js event " + Date.now(),
        location: "test.js",
        maxPlayers: 16,
        dateTime: Date.now(),
        description: "something"
    });

    console.log(eventRes);
    assert(eventRes.id);

    let bracketRes = await req("/bracket", "POST", {
        event: eventRes.id
    });

    console.log(bracketRes);
    assert(bracketRes.id);

    const bID = bracketRes.id;

    for(let i=0; i < 10; i++) {
        let addPlayerResult = await req(`/bracket/${bID}/players`, "POST", {
            playerUsername: `user_${i+1}`
        });
        console.log(addPlayerResult);
    }

    let matchupRes = await req(`/bracket/${bID}/matchups`, "GET");
    console.log(matchupRes);

    let eventListRes = await req(`/event`, "GET");
    console.log(eventListRes);
}

async function main() {
    await getAuth();
    // await deleteAllEvents();
    await createEvent();
}

main();