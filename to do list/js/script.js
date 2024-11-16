document.addEventListener("DOMContentLoaded", loadTasks);

const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const completedTaskList = document.getElementById("completedTaskList");
const clearBoardButton = document.getElementById("clearBoardButton");

let editingTaskId = null;

addTaskButton.addEventListener("click", addOrUpdateTask);
clearBoardButton.addEventListener("click", clearBoard);

function addOrUpdateTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const startDate = document.getElementById("taskStartDate").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const tags = document.getElementById("taskTags").value.trim();

    if (title === "") return;

    if (editingTaskId) {
        updateTask(editingTaskId, title, description, priority, startDate, dueDate, tags);
    } else {
        const task = {
            id: Date.now(),
            title,
            description,
            priority,
            startDate,
            dueDate,
            tags,
            status: "En Proceso",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        saveTask(task);
        appendTaskToList(task);
    }

    clearForm();
    editingTaskId = null;
}

function appendTaskToList(task) {
    const li = document.createElement("li");
    li.className = `task-item ${getPriorityClass(task.priority)}`;
    li.dataset.id = task.id;
    li.innerHTML = `
        <div class="task-info">
            <span><strong>${task.title}</strong> (${task.priority})</span>
            <span>${task.status}</span>
        </div>
        <p>${task.description}</p>
        <p>Inicio: ${task.startDate} | Vencimiento: ${task.dueDate}</p>
        <p>Etiquetas: ${task.tags || "Ninguna"}</p>
        <div class="task-actions">
            ${task.status === "En Proceso" ? `
                <button onclick="editTask(${task.id})">Editar</button>
                <button onclick="finalizeTask(${task.id})">Finalizar</button>
            ` : ''}
            <button onclick="moveToTrash(${task.id})">Eliminar</button>
        </div>
    `;
    if (task.status === "En Proceso") {
        taskList.appendChild(li);
    } else {
        completedTaskList.appendChild(li);
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case "Baja":
            return "baja";
        case "Media":
            return "media";
        case "Alta":
            return "alta";
        default:
            return "";
    }
}


function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(appendTaskToList);
}

function finalizeTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.status = "Finalizada";
            task.updatedAt = new Date().toISOString();
        }
        return task;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskList();
}

function moveToTrash(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskToTrash = tasks.find(task => task.id === taskId);

    if (taskToTrash) {
        // Cambiar el estado de la tarea a "Finalizada"
        taskToTrash.status = "Finalizada";
        taskToTrash.updatedAt = new Date().toISOString();

        // Agregar la tarea a la Papelera
        let trash = JSON.parse(localStorage.getItem("trash")) || [];
        trash.push(taskToTrash);
        localStorage.setItem("trash", JSON.stringify(trash));
    }

    // Eliminar la tarea del listado principal
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskList();

    // Enviar un mensaje para actualizar la Papelera
    window.postMessage({ type: "updateTrash" }, "*");
}



function clearBoard() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let trash = JSON.parse(localStorage.getItem("trash")) || [];
    trash = trash.concat(tasks);
    localStorage.setItem("trash", JSON.stringify(trash));
    localStorage.removeItem("tasks");
    updateTaskList();
}

function updateTaskList() {
    taskList.innerHTML = "";
    completedTaskList.innerHTML = "";
    loadTasks();
}

function clearForm() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskPriority").value = "Baja";
    document.getElementById("taskStartDate").value = "";
    document.getElementById("taskDueDate").value = "";
    document.getElementById("taskTags").value = "";
}

function editTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskToEdit = tasks.find(task => task.id === taskId);

    if (taskToEdit && taskToEdit.status === "En Proceso") {
        document.getElementById("taskTitle").value = taskToEdit.title;
        document.getElementById("taskDescription").value = taskToEdit.description;
        document.getElementById("taskPriority").value = taskToEdit.priority;
        document.getElementById("taskStartDate").value = taskToEdit.startDate;
        document.getElementById("taskDueDate").value = taskToEdit.dueDate;
        document.getElementById("taskTags").value = taskToEdit.tags;

        editingTaskId = taskId;
    }
}

function updateTask(taskId, title, description, priority, startDate, dueDate, tags) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.startDate = startDate;
            task.dueDate = dueDate;
            task.tags = tags;
            task.updatedAt = new Date().toISOString();
        }
        return task;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskList();
}
