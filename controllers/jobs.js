const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");

const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: JobId },
  } = req;

  const job = await Job.findOne({ _id: JobId, createdBy: userId });
  if (!job) {
    throw new NotFoundError(`No job found fofr job with id ${JobId}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: JobId },
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError("please provide company and position fields");
  }

  const job = await Job.findOneAndUpdate(
    { _id: JobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job found fofr job with id ${JobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: JobId },
  } = req;

  const job = await Job.findOneAndRemove({
    _id: JobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job found for job with id ${JobId}`);
  }
  res.status(StatusCodes.OK).send("job deleted successfully");
};

module.exports = {
  getJob,
  getAllJobs,
  updateJob,
  createJob,
  deleteJob,
};
