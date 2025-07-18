//1. 할일 추가 기능      post / tasks 
//2. 할일 보여주기 기능  get / tasks
//3. 할일 수정하기 기능  put/tasks/:id
//4. 할일 삭제하기 기능  delete / tasks/:id

// 백앤드 중요한것 테이블 디자인, 주소(도메인) 디자인 하는것이 중요하다.


const express = require("express");
const router = express.Router(); // router: Express에서 제공하는 "미니 서버" 또는 "하위 라우팅 시스템"
const taskApi = require("./task.api");

router.use("/tasks", taskApi); //  /api/tasks로 들어온 요청을 taskApi로 위임

module.exports = router;



