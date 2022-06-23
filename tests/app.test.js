const app = require("../app");
const request = require("supertest");

describe("GET /", () => {
  test("root route", async () => {
    const res = await request(app).get("/").send();
    console.log(res.body);
    expect(res.statusCode).toBe(200);
  });
});
