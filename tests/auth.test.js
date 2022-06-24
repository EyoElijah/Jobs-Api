const app = require("../app");
const User = require("../models/User");
const request = require("supertest");

const { faker } = require("@faker-js/faker");

// afterAll(async () => {
//   await User.deleteMany();
// });

const signUpData = {
  name: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

describe("POST auth / register route", () => {
  test("should register a user /register", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/register")
      .send(signUpData);

    expect(statusCode).toBe(201);
    expect(body.token).toBeTruthy();
    expect(body.user).toBeTruthy();
    expect(body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          name: expect.any(String),
        }),
        token: expect.any(String),
      })
    );
  });

  test("should not register a user with an email taken ", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/register")
      .send(signUpData);

    expect(statusCode).toBe(400);
    expect(body.token).toBeFalsy();
    expect(body.user).toBeFalsy();
    expect(body).toEqual({
      msg: "Duplicate value entered for email field, please choose another value",
    });
  });

  test("should not register a user if name field is ommited ", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

    expect(statusCode).toEqual(400);
    expect(body.token).toBeFalsy();
    expect(body.user).toBeFalsy();
    expect(body).toEqual({
      msg: "Please provide a name",
    });
  });

  test("should not register a user if email field is ommited ", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: faker.internet.userName(),
        password: faker.internet.password(),
      });

    expect(statusCode).toEqual(400);
    expect(body.token).toBeFalsy();
    expect(body.user).toBeFalsy();
    expect(body).toEqual({
      msg: "Please provide an email",
    });
  });

  test("should not register a user if password field is ommited ", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: faker.internet.userName(),
        email: faker.internet.email(),
      });

    expect(statusCode).toEqual(400);
    expect(body.token).toBeFalsy();
    expect(body.user).toBeFalsy();
    expect(body).toEqual({
      msg: "Please provide password",
    });
  });

  test("should not register a user if password field is less than 6 ", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: faker.internet.userName(),
        email: faker.internet.email(),
        password: 12345,
      });

    expect(statusCode).toEqual(400);
    expect(body.token).toBeFalsy();
    expect(body.user).toBeFalsy();
    expect(body).toEqual({
      msg: "Path `password` (`12345`) is shorter than the minimum allowed length (6).",
    });
  });
});

describe("POST auth /login routes", () => {
  test("should login a user with correct details", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: signUpData.email,
        password: signUpData.password,
      });

    expect(statusCode).toEqual(200);
    expect(body.user).toBeTruthy();
    expect(body.token).toBeTruthy();
    expect(body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          name: expect.any(String),
        }),
        token: expect.any(String),
      })
    );
  });

  test("should not login the user if email is not provided", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/login")
      .send({
        password: signUpData.password,
      });

    expect(statusCode).toEqual(400);
    expect(body.user).toBeFalsy();
    expect(body.token).toBeFalsy();
    expect(body.msg).toBe("please provide email and password");
  });

  test("should not login the user if password is not provided", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: signUpData.email,
      });

    expect(statusCode).toEqual(400);
    expect(body.user).toBeFalsy();
    expect(body.token).toBeFalsy();
    expect(body.msg).toBe("please provide email and password");
  });

  test("should not login if the details are incorrect", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "favo@gmail.com",
        password: "password",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(statusCode).toEqual(401);
    expect(body.user).toBeFalsy();
    expect(body.token).toBeFalsy();
    expect(body).toEqual({
      msg: "Invalid Credential",
    });
  });
});

module.exports = { signUpData };
