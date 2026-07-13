import { Router } from "express";
import schoolsRouter from "./schools";
import departmentsRouter from "./departments";
import coursesRouter from "./courses";
import usersRouter from "./users";
import assignmentsRouter from "./assignments";

const v1Router = Router();

v1Router.use("/", schoolsRouter);
v1Router.use("/", departmentsRouter);
v1Router.use("/", coursesRouter);
v1Router.use("/", usersRouter);
v1Router.use("/", assignmentsRouter);

export default v1Router;
