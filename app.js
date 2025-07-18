const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index"); // api 처리
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use("/api", indexRouter);

const mongoURI = process.env.MONGODB_LOCAL;
mongoose.connect(mongoURI).then(()=> console.log("mongoose connected")).catch((err)=>console.log("db connected fail", err));

app.listen(5000, () => console.log("server on at 5000")); //해당 포트를 열고 요청을 듣기 시작, 서버 준비시킴


