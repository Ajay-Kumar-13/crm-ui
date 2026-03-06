
import { Response } from "miragejs";

export const accessToken = (schema, request) => {
    const {username, password} = JSON.parse(request.requestBody);
    console.log(username);
    if (username === "test" && password === "test") {
        return new Response(200, {}, {"jwtToken": "mock-jwt-token"})
    }
    return new Response(401, {}, {message: "Invalid Credentials"});
}