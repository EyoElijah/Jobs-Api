const app = require("../app");
const Job = require("../models/Job");
const request = require("supertest");

let accessToken;
let jobId;
beforeEach(async () => {
  try {
    const res = await request(app).post("/api/v1/auth/login").send({
      name: "favour",
      email: "favour@gmail.com",
      password: "password",
    });
    accessToken = res.body.token;
  } catch (error) {
    console.log(error);
  }
});

// afterAll(async () => {
//   await Job.deleteMany();
// });

describe("POST post job routes /jobs", () => {
  test("should post a job if a user is logged in", async () => {
    const response = await request(app)
      .post("/api/v1/jobs")
      .send({
        company: "Quora",
        position: "front-end developer",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    jobId = response.body.job._id;
    expect(response.statusCode).toBe(201);
    expect(response.body.job).toBeTruthy();
    expect(response.body.job.position).toBe("front-end developer");
    expect(response.body.job.status).toEqual("pending");
  });

  test("should not post a job if the user is not logged in", async () => {
    const response = await request(app).post("/api/v1/jobs").send({
      company: "apple",
      position: "manager",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.msg).toEqual("Authentication invalid");
    expect(response.body.job).toBeFalsy();
  });

  test("should not post a job if company field is not provided", async () => {
    const response = await request(app)
      .post("/api/v1/jobs")
      .send({
        position: "manager",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.msg).toEqual("please provide a company name");
    expect(response.body.job).toBeFalsy();
  });

  test("should not post a job if position field is not provided", async () => {
    const response = await request(app)
      .post("/api/v1/jobs")
      .send({
        company: "apple",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.msg).toEqual("please provide a position");
    expect(response.body.job).toBeFalsy();
  });
});

describe("GET all Jobs routes /jobs", () => {
  test("should get all jobs by a specific user", async () => {
    const response = await request(app)
      .get("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.jobs).toBeTruthy();
    expect(response.body.count).toEqual(response.body.jobs.length);
  });

  test("should not get all jobs if no authorization token is present", async () => {
    const response = await request(app).get("/api/v1/jobs");
    expect(response.statusCode).toEqual(401);
    expect(response.body.jobs).toBeFalsy();
    expect(response.body.msg).toEqual("Authentication invalid");
  });
});

describe("GET a single job ", () => {
  test("should get a single job provided authorization", async () => {
    const response = await request(app)
      .get(`/api/v1/jobs/${jobId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.job).toBeTruthy();
    expect(response.body.job.status).toEqual("pending");
  });

  test("should not get a single job if no authorization is set", async () => {
    const response = await request(app).get(`/api/v1/jobs/${jobId}`);
    //   .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(401);
    expect(response.body.jobs).toBeFalsy();
    expect(response.body.msg).toEqual("Authentication invalid");
  });
});
