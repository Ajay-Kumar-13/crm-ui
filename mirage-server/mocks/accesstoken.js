
import { Response } from "miragejs";

export const accessToken = (schema, request) => {
    const {username, password} = JSON.parse(request.requestBody);
    if (username === "root" && password === "test") {
        return new Response(200, {}, {"accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJyb2xlcyI6IlJPT1QiLCJhdXRob3JpdGllcyI6WyJSRUFEIiwiVVBEQVRFIiwiREVMRVRFIiwiQ1JFQVRFIl0sImV4cCI6MTc3MjkwODc4OX0.42rcTt7yL3hiOcYsCKowjyOZFJt8rlcbNz4bnK-Ipi8"})
    } else if (username === "admin" && password === "test") {
        return new Response(200, {}, {"accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJyb2xlcyI6IkFETUlOIiwiYXV0aG9yaXRpZXMiOlsiUkVBRCIsIlVQREFURSIsIkRFTEVURSIsIkNSRUFURSJdLCJleHAiOjE3NzI5MDg3ODl9.GQUbNUNTbFDoCdMkurNZUUvOp6k-sWEShvMxs6x9SKI"})
    } else if (username === "employee" && password === "test") {
        return new Response(200, {}, {"accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlbXBsb3llZSIsImlkIjoiNGJkNWU1NTctNTU3OS00ZmRiLTg5MWUtNmY2NWE0N2IyYWMwIiwicm9sZXMiOiJFTVBMT1lFRSIsImF1dGhvcml0aWVzIjpbIlJFQUQiLCJVUERBVEUiXSwiZXhwIjoxNzc1OTAyNjkzfQ.4ZT8wEKEuX2b9sqWL_PdYcw3Yo4iTIlOhiHvqDDPtZQ"})
    }
    return new Response(401, {}, {message: "Invalid Credentials"});
}


export const refreshToken = (schema, request) => {
    return new Response(200, {}, {"accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJyb2xlcyI6IkFETUlOIiwiYXV0aG9yaXRpZXMiOlsiUkVBRCIsIlVQREFURSIsIkRFTEVURSIsIkNSRUFURSJdLCJleHAiOjE3NzI5MDg3ODl9.GQUbNUNTbFDoCdMkurNZUUvOp6k-sWEShvMxs6x9SKI"});
}