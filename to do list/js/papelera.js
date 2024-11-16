document.addEventListener("DOMContentLoaded", loadTrash);

const trashList = document.getElementById("trashList");
const clearTrashButton = document.getElementById("clearTrashButton");

function loadTrash() {
    trashList.innerHTML = ""; // Limpiar la lista antes de cargar las tareas
    const trash = JSON.parse(localStorage.getItem("trash")) || [];
    trash.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${getPriorityClass(task.priority)}`;
        li.innerHTML = `
            <div class="task-info">
                <span><strong>${task.title}</strong> (${task.priority})</span>
                <span>${task.status}</span>
            </div>
            <p>${task.description}</p>
            <p>Inicio: ${task.startDate} | Vencimiento: ${task.dueDate}</p>
            <p>Etiquetas: ${task.tags || "Ninguna"}</p>
        `;
        trashList.appendChild(li);
    });
}

// Escuchar el mensaje para actualizar la Papelera
window.addEventListener("updateTrash", (event) => {
    if (event.data && event.data.type === "updateTrash") {
        loadTrash(); // Actualizar la lista de la Papelera automáticamente
    }
});

// Limpiar la Papelera de reciclaje
clearTrashButton.addEventListener("click", clearTrash);

function clearTrash() {
    localStorage.removeItem("trash");
    loadTrash(); // Actualizar automáticamente la lista
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
