const app = require("../app");
const Job = require("../models/Job");
const request = require("supertest");
const { signUpData } = require("./auth.test");

let accessToken;
let jobId;
beforeEach(async () => {
  try {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: signUpData.email,
      password: signUpData.password,
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
    const { statusCode, body } = await request(app)
      .post("/api/v1/jobs")
      .send({
        company: "Linkedin",
        position: "full stack engineer",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    jobId = body.job._id;
    expect(statusCode).toBe(201);
    expect(body.job).toBeTruthy();
    expect(body.job.status).toEqual("pending");
    expect(body).toEqual({
      job: expect.any(Object),
    });
    expect(body).toEqual(
      expect.objectContaining({
        job: expect.objectContaining({
          status: expect.any(String),
          _id: expect.any(String),
          company: expect.any(String),
          position: expect.any(String),
          createdBy: expect.any(String),
        }),
      })
    );
  });

  test("should not post a job if the user is not logged in", async () => {
    const { statusCode, body } = await request(app).post("/api/v1/jobs").send({
      company: "apple",
      position: "manager",
    });
    expect(statusCode).toBe(401);
    expect(body).toEqual({ msg: "Authentication invalid" });
    expect(body.job).toBeFalsy();
  });

  test("should not post a job if company field is not provided", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/jobs")
      .send({
        position: "manager",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(statusCode).toBe(400);
    expect(body).toEqual({ msg: "please provide a company name" });
    expect(body.job).toBeFalsy();
  });

  test("should not post a job if position field is not provided", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/v1/jobs")
      .send({
        company: "apple",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(statusCode).toBe(400);
    expect(body).toEqual({ msg: "please provide a position" });
    expect(body.job).toBeFalsy();
  });
});

describe("GET all Jobs routes /jobs", () => {
  test("should get all jobs by a specific user", async () => {
    const { statusCode, body } = await request(app)
      .get("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(statusCode).toEqual(200);
    expect(body.jobs).toBeTruthy();
    expect(body.count).toEqual(body.jobs.length);
    expect(body).toEqual(
      expect.objectContaining({
        jobs: expect.arrayContaining([
          expect.objectContaining({
            status: expect.any(String),
            company: expect.any(String),
            position: expect.any(String),
            createdBy: expect.any(String),
          }),
        ]),
      })
    );
  });

  test("should not get all jobs if no authorization token is present", async () => {
    const { statusCode, body } = await request(app).get("/api/v1/jobs");
    expect(statusCode).toEqual(401);
    expect(body.jobs).toBeFalsy();
    expect(body).toEqual({ msg: "Authentication invalid" });
  });
});

describe("GET a single job ", () => {
  test("should get a single job provided authorization", async () => {
    const { statusCode, body } = await request(app)
      .get(`/api/v1/jobs/${jobId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(statusCode).toBe(200);
    expect(body.job).toBeTruthy();
    expect(body.job.status).toEqual("pending");
    expect(body).toEqual(
      expect.objectContaining({
        job: expect.objectContaining({
          status: expect.any(String),
          company: expect.any(String),
          position: expect.any(String),
          createdBy: expect.any(String),
        }),
      })
    );
  });

  test("should not get a single job if no authorization is set", async () => {
    const { statusCode, body } = await request(app).get(
      `/api/v1/jobs/${jobId}`
    );
    //   .set("Authorization", `Bearer ${accessToken}`);
    expect(statusCode).toEqual(401);
    expect(body.jobs).toBeFalsy();
    expect(body).toEqual(
      expect.objectContaining({
        msg: "Authentication invalid",
      })
    );
  });
});

describe("PATCH a single job", () => {
  test("should update a single job provided authorization", async () => {
    const newJob = {
      company: "Facebook",
      position: "Technical Lead",
    };
    const { statusCode, body } = await request(app)
      .patch(`/api/v1/jobs/${jobId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(newJob);
    expect(statusCode).toBe(200);
    expect(body.job).toBeTruthy();
    expect(body).toEqual(
      expect.objectContaining({
        job: expect.objectContaining({
          status: expect.any(String),
          company: expect.any(String),
          position: expect.any(String),
          createdBy: expect.any(String),
        }),
      })
    );
  });

  test("should not update if not authorization is provided", async () => {
    const newJob = {
      company: "Facebook",
      position: "Technical Lead",
    };
    const { statusCode, body } = await request(app)
      .patch(`/api/v1/jobs/${jobId}`)
      .send(newJob);
    //   .set("Authorization", `Bearer ${accessToken}`);
    expect(statusCode).toEqual(401);
    expect(body.jobs).toBeFalsy();
    expect(body).toEqual({ msg: "Authentication invalid" });
  });
});

describe("Delete job routes", () => {
  test("should delete a job belonging a particular user", async () => {
    const { statusCode, body } = await request(app)
      .delete(`/api/v1/jobs/${jobId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(statusCode).toBe(200);
  });

  test("should not delete a job belonging a particular user if not authorization is provided", async () => {
    const { statusCode, body } = await request(app).delete(
      `/api/v1/jobs/${jobId}`
    );
    //   .set("Authorization", `Bearer ${accessToken}`);

    expect(statusCode).toEqual(401);
    expect(body).toEqual(
      expect.objectContaining({
        msg: "Authentication invalid",
      })
    );
  });
});
