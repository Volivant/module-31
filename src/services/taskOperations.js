import { getFromStorage, addToStorage } from "../utils";
import { User } from "../models/User";
import { Task } from "../models/Task";
import taskFieldTemplate from "../templates/taskField.html";
import { appState } from "../app";

export const getTaskList = function () {
    let tasks = getFromStorage("tasks");
    
    if (tasks.length == 0) return false;
    for (let task of tasks) {
        let taskColumn;
        switch (task.state) {
            case "backlog":
                taskColumn = document.querySelector(".card-backlog"); break;
            case "ready":
                taskColumn = document.querySelector(".card-ready"); break;
            case "progress":
                taskColumn = document.querySelector(".card-progress"); break;
            case "finished":
                taskColumn = document.querySelector(".card-finished"); break;
        }
        if (appState.currentUser.role == "admins" || task.user == appState.currentUser.login){
            let taskElement = document.createElement('div');
            taskElement.classList.add("card-element");
            taskElement.setAttribute("draggable", "true");
            taskElement.innerHTML = task.name;
            taskElement.addEventListener("dragstart", () => {
                taskElement.classList.add("is-dragging");
            });
            
            taskElement.addEventListener("dragend", () => {
                taskElement.classList.remove("is-dragging");
            });
            if (appState.currentUser.role == "admins") {
                taskElement.innerHTML += '/' + task.user;
            }
            taskColumn.append(taskElement);
        }
    }

    return true;
};
// сохранение задач с доски в харнилище
export const saveTaskList = function () {
    let tasks = getFromStorage("tasks"); //взяли задачи из хранилища
    
    if (tasks.length == 0) return false;
    localStorage.removeItem("tasks");
    const taskColumn = document.querySelectorAll(".card-body");// взяли указатели на каточки с задачами с доски
    
    for (let task of tasks) { //цикл по задачам из хранилища
        for (let column of taskColumn){//цикл по карточкам
            const taskElement = column.querySelectorAll('.card-element'); // взяли указатели на задачи из карточки
            if (taskElement.length != 0) {
                for (let element of taskElement) { // цикл по задачам из каточки
                    if (appState.currentUser.role == "admins"){
                        if (element.innerHTML == task.name + "/" + task.user) {
                            if (column.classList.contains("card-backlog")){
                                task.state = "backlog";
                            }
                            if (column.classList.contains("card-ready")){
                                task.state = "ready";
                                
                            }
                            if (column.classList.contains("card-progress")){
                                task.state = "progress";
                            }
                            if (column.classList.contains("card-finished")){
                                task.state = "finished";
                            }
                        }
                    } else {
                        if (element.innerHTML == task.name && appState.currentUser.login == task.user) {
                            if (column.classList.contains("card-backlog")){
                                task.state = "backlog";
                            }
                            if (column.classList.contains("card-ready")){
                                task.state = "ready";
                                
                            }
                            if (column.classList.contains("card-progress")){
                                task.state = "progress";
                            }
                            if (column.classList.contains("card-finished")){
                                task.state = "finished";
                            }
                        }
                    }
                }
            }
        }
        Task.save(task);
    }
    
    return true;
};

export const getDrag = function () {
    //реализация перетаскивания
    const draggables = document.querySelectorAll(".card-element");
    const droppables = document.querySelectorAll(".card-body");

    draggables.forEach((task) => {
        task.addEventListener("dragstart", () => {
            task.classList.add("is-dragging");
        });
        task.addEventListener("dragend", () => {
            task.classList.remove("is-dragging");
        });
    });

    droppables.forEach((zone) => {
        zone.addEventListener("dragover", (e) => {
            e.preventDefault();

            const bottomTask = insertAboveTask(zone, e.clientY);
            const curTask = document.querySelector(".is-dragging");

            if (!bottomTask) {
            zone.appendChild(curTask);
            } else {
            zone.insertBefore(curTask, bottomTask);
            }
        });
    });

    const insertAboveTask = (zone, mouseY) => {
        const els = zone.querySelectorAll(".card-element:not(.is-dragging)");

        let closestTask = null;
        let closestOffset = Number.NEGATIVE_INFINITY;

        els.forEach((task) => {
            const { top } = task.getBoundingClientRect();

            const offset = mouseY - top;

            if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
            }
        });

        return closestTask;
    };
    //конец реализации перетаскивания
    return true;
};

export const saveTaskInColumn = function(taskColumn, removeTask) {
    let taskInput = taskColumn.querySelector('.input-task');
    let taskElement = document.createElement('div');
    if (taskInput.value != '') {
        
        taskElement.classList.add("card-element");
        taskElement.setAttribute("draggable", "true");
        taskElement.innerHTML = taskInput.value;
        taskElement.addEventListener("dragstart", () => {
            taskElement.classList.add("is-dragging");
        });
        
        taskElement.addEventListener("dragend", () => {
            taskElement.classList.remove("is-dragging");
        });
        taskColumn.append(taskElement);
        if (removeTask != null) {
            const removeElements = removeTask.querySelectorAll('.card-element');
            for (let el of removeElements) {
                if (el.innerHTML == taskElement.innerHTML) {
                    el.remove();
                }
            }
        }
    }
    taskInput.remove();
    return taskElement;
};

export const addTaskBacklog = function () {
    document.querySelector(".btn-backlog").onclick = function(){
        const addBtn = document.querySelector(".btn-backlog");
        const taskColumn = document.querySelector(".card-backlog");
        if (addBtn.getAttribute('type') == 'button'){ //добавление задачи, вставка поля ввода
            let taskInput = document.createElement('input');
            taskInput.classList.add("input-task");
            taskColumn.append(taskInput);
            taskInput.addEventListener('focusout', function (event) { //обработчик потери фокуса строки ввода
                
                let task = saveTaskInColumn(taskColumn, null);
                if (task.innerHTML != ""){
                    if (appState.currentUser.role == "admins"){
                        const testTask = new Task(task.innerHTML.slice(0,task.innerHTML.indexOf("/")), 
                        task.innerHTML.slice(task.innerHTML.indexOf("/")+1));
                        Task.save(testTask);
                    } else {
                        const testTask = new Task(task.innerHTML, appState.currentUser.login);
                        Task.save(testTask);
                    }
                }
                addBtn.setAttribute('type', 'button');
                addBtn.textContent = 'Add';
            });
            addBtn.setAttribute('type', 'submit');
            addBtn.textContent = 'Submit';
        } else { //запись задачи в localstorage
            let task = saveTaskInColumn(taskColumn, null);
            if (task.innerHTML != ""){
                if (appState.currentUser.role == "admins"){
                    const testTask = new Task(task.innerHTML.slice(0,task.innerHTML.indexOf("/")), 
                    task.innerHTML.slice(task.innerHTML.indexOf("/")+1));
                    Task.save(testTask);
                } else {
                    const testTask = new Task(task.innerHTML, appState.currentUser.login);

                    
                    Task.save(testTask);
                }
            }
            
            addBtn.setAttribute('type', 'button');
            addBtn.textContent = 'Add';
        }
    };
    
    return true;
};

// добавление задачи через выпадающий список
const addTaskSelect = function(source, receiver) {
    const taskSelect = document.createElement('select');// указатель на элемент select
    taskSelect.name = 'taskSelect';
    taskSelect.classList.add('input-task');
   
    const taskSourceElelments = source.querySelectorAll('.card-element'); //указатель на элементы источника задач
    for (let task of taskSourceElelments) {
        let optionSelect = document.createElement('option');
        optionSelect.value = task.textContent;
        optionSelect.text = task.textContent;
        taskSelect.appendChild(optionSelect);
    }
    
    receiver.append(taskSelect);
    
    return taskSelect;
};

export const addTaskReady = function (addBtnClass, sourceClass, receiverClass) {
    document.querySelector(addBtnClass).onclick = function(){
        // const addBtn = document.querySelector(".btn-ready");
        //const source = document.querySelector(".card-backlog");
        //const receiver = document.querySelector(".card-ready");
        const addBtn = document.querySelector(addBtnClass);
        const source = document.querySelector(sourceClass);
        const receiver = document.querySelector(receiverClass);
        
        if (addBtn.getAttribute('type') == 'button'){ //добавление задачи, вставка списка
            let taskSelect = addTaskSelect(source, receiver);
            taskSelect.addEventListener('focusout', function (event) { //обработчик потери фокуса строки ввода
                saveTaskInColumn(receiver, source);
                addBtn.setAttribute('type', 'button');
                addBtn.textContent = 'Add';
            });
            addBtn.setAttribute('type', 'submit');
            addBtn.textContent = 'Submit';
        } else { //запись задачи в localstorage
            saveTaskInColumn(receiver, source);
            addBtn.setAttribute('type', 'button');
            addBtn.textContent = 'Add';
        }
    };
    
    return true;
};