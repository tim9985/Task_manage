const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = Schema(
    {
        task: { type: String, required: true },
        isComplete: { type: Boolean, required: true, default: false },
    },
    { timestamps: true } // createdAt, updatedAt 자동으로 추가됨 
);

const Task = mongoose.model("Task", taskSchema); //MongoDB의 tasks 컬렉션을 위한 모델(Task)을 생성, DB의 tasks 컬렉션과 연결됨
// MongoDB에서는 자동으로 소문자 + 복수형(tasks)으로 컬렉션 이름이 만들어짐

module.exports = Task; //다른 파일에서 이 모델을 사용할 수 있도록 Task 모델을 내보내기