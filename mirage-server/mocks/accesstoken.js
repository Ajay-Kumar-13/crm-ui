
import { Response } from "miragejs";

export const accessToken = (schema, request) => {
    const {username, password} = JSON.parse(request.requestBody);
    if (username === "test" && password === "test") {
        return new Response(200, {}, {"accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJyb2xlcyI6IlJPT1QiLCJhdXRob3JpdGllcyI6WyJSRUFEIiwiVVBEQVRFIiwiREVMRVRFIiwiQ1JFQVRFIl0sImV4cCI6MTc3MjkwODc4OX0.42rcTt7yL3hiOcYsCKowjyOZFJt8rlcbNz4bnK-Ipi8"})
    }
    return new Response(401, {}, {message: "Invalid Credentials"});
}