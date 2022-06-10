const app = require("../app");
const User = require("../models/User");
const request = require("supertest");

afterAll(async () => {
  await User.deleteMany();
});

describe("POST auth / register route", () => {
  test("should register a user /register", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "favour",
      email: "favour@gmail.com",
      password: "password",
    });

    expect(response.statusCode).toEqual(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user).toBeTruthy();
    expect(response.body.user.name).toBe("favour");
  });

  test("should not register a user with an email taken ", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "favour",
      email: "favour@gmail.com",
      password: "password",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.token).toBeFalsy();
    expect(response.body.user).toBeFalsy();
    expect(response.body.msg).toBe(
      "Duplicate value entered for email field, please choose another value"
    );
  });

  test("should not register a user if name field is ommited ", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "favour@gmail.com",
      password: "password",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.token).toBeFalsy();
    expect(response.body.user).toBeFalsy();
    expect(response.body.msg).toBe("Please provide a name");
  });

  test("should not register a user if email field is ommited ", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "favour",
      password: "password",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.token).toBeFalsy();
    expect(response.body.user).toBeFalsy();
    expect(response.body.msg).toBe("Please provide an email");
  });

  test("should not register a user if password field is ommited ", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "favour",
      email: "favour@gmail.com",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.token).toBeFalsy();
    expect(response.body.user).toBeFalsy();
    expect(response.body.msg).toBe("Please provide password");
  });

  test("should not register a user if password field is less than 6 ", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "favour",
      email: "favour@gmail.com",
      password: "pass",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.token).toBeFalsy();
    expect(response.body.user).toBeFalsy();
    expect(response.body.msg).toBe(
      "Path `password` (`pass`) is shorter than the minimum allowed length (6)."
    );
  });
});

describe("POST auth /login routes", () => {
  test("should login a user with correct details", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "favour@gmail.com",
      password: "password",
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.user).toBeTruthy();
    expect(response.body.token).toBeTruthy();
  });

  test("should not login the user if email is not provided", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      password: "password",
    });
    expect(response.statusCode).toEqual(400);
    expect(response.body.user).toBeFalsy();
    expect(response.body.token).toBeFalsy();
    expect(response.body.msg).toBe("please provide email and password");
  });

  test("should not login the user if password is not provided", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      password: "password",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.user).toBeFalsy();
    expect(response.body.token).toBeFalsy();
    expect(response.body.msg).toBe("please provide email and password");
  });

  test("should not login if the details are incorrect", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "favo@gmail.com",
        password: "password",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(response.statusCode).toEqual(401);
    expect(response.body.user).toBeFalsy();
    expect(response.body.token).toBeFalsy();
    expect(response.body.msg).toBe("Invalid Credential");
  });
});
