const Task = require("../models/Task");

const taskController = {}

taskController.createTask = async (req, res) => {
    try {
        const { task, isComplete } = req.body;
        const newTask = new Task({ task, isComplete })
        await newTask.save()
        return res.status(200).json({ status: "OK", data: newTask })

    } catch (error) {
        res.status(400).json({ status: "fail", error });
    }
};

taskController.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find(); // mongoose 공식 문서 홈피에 함수 다 나옴
        return res.status(200).json({ status: "OK", data: tasks });
    } catch (error) {
        res.statsus(400).json({ statsus: "fail", error });
    }
};

taskController.modifyTasks = async (req, res) => {
    try {
        const { id } = req.params; // /tasks/:id 에서  id 추출, 즉 요청 URL 경로 안의 파라미터(리소스 ID나 고유한 값)를 포함시킬때 사용
        const { task, isComplete } = req.body; // 수정할 내용

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { task, isComplete },
            { new: true } // 수정 후 결과를 반환하도록 설정
        );

        if (!updatedTask) {
            return res.status(404).json({ status: "fail", message: "Task not found" });
        }

        return res.status(200).json({ status: "OK", data: updatedTask });

    } catch (error) {
        res.status(400).json({ status: "fail", error });
    }
};


taskController.deleteTasks = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ status: "fail", message: "Task not found" });
        }

        return res.status(200).json({ status: "OK", data: deletedTask });

    } catch (error) {

    }
}

module.exports = taskController;