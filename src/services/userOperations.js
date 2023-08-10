import { getFromStorage, addToStorage } from "../utils";
import { User } from "../models/User";
import { Task } from "../models/Task";
import taskFieldTemplate from "../templates/taskField.html";
import { appState } from "../app";
import { saveTaskInColumn } from "./taskOperations"

export const getUsersList = function () {
    let users = getFromStorage("users");
    
    if (users.length == 0) return false;
    for (let user of users) {
        let userColumn;
        console.log(user.role);        
        switch (user.role) {
            case "users":
                userColumn = document.querySelector(".card-users"); break;
            case "admins":
                userColumn = document.querySelector(".card-admins"); break;
        }
        let userElement = document.createElement('div');
        userElement.classList.add("card-element");
        userElement.setAttribute("draggable", "true");
        userElement.innerHTML = user.login + '/' + user.password;
        userElement.addEventListener("dragstart", () => {
            userElement.classList.add("is-dragging");
        });
        
        userElement.addEventListener("dragend", () => {
            userElement.classList.remove("is-dragging");
        });
        
        userColumn.append(userElement);
    }

    return true;
};

// сохранение пользователей в харнилище
export const saveUsersList = function () {
    let users = getFromStorage("users"); //взяли из хранилища
    
    if (users.length == 0) return false;
    localStorage.removeItem("users");
    const userColumn = document.querySelectorAll(".card-body");// взяли указатели на каточки с доски
    
    for (let user of users) { //цикл по задачам из хранилища
        for (let column of userColumn){//цикл по карточкам
            const userElement = column.querySelectorAll('.card-element'); // взяли указатели из карточки
            if (userElement.length != 0) {
                for (let element of userElement) { // цикл по пользователям из каточки
                    if (element.innerHTML == user.login + "/" + user.password) {
                        user.role = (column.classList.contains("card-admins")) ? "admins" : "users";
                    }
                }
            }
        }
        User.save(user);
    }
    
    return true;
};

//Добавление администратора

export const addAdmin = function () {
    document.querySelector(".btn-admins").onclick = function(){
        const addBtn = document.querySelector(".btn-admins");
        const taskColumn = document.querySelector(".card-admins");
        if (addBtn.getAttribute('type') == 'button'){ //добавление админа, вставка поля ввода
            let taskInput = document.createElement('input');
            taskInput.classList.add("input-task");
            taskColumn.append(taskInput);
            taskInput.addEventListener('focusout', function (event) { //обработчик потери фокуса строки ввода
                
                let task = saveTaskInColumn(taskColumn, null);
                if (task.innerHTML != ""){
                    const testTask = new User(task.innerHTML.slice(0,task.innerHTML.indexOf("/")), 
                    task.innerHTML.slice(task.innerHTML.indexOf("/")+1), "admins");
                    User.save(testTask);
                }
                addBtn.setAttribute('type', 'button');
                addBtn.textContent = 'Add';
            });
            addBtn.setAttribute('type', 'submit');
            addBtn.textContent = 'Submit';
        } else { //запись задачи в localstorage
            let task = saveTaskInColumn(taskColumn, null);
            if (task.innerHTML != ""){
                const testTask = new User(task.innerHTML.slice(0,task.innerHTML.indexOf("/")), 
                task.innerHTML.slice(task.innerHTML.indexOf("/")+1), "admins");
                User.save(testTask);
            }
            
            addBtn.setAttribute('type', 'button');
            addBtn.textContent = 'Add';
        }
    };
    
    return true;
};

export const addUser = function () {
    document.querySelector(".btn-users").onclick = function(){
        const addBtn = document.querySelector(".btn-users");
        const taskColumn = document.querySelector(".card-users");
        if (addBtn.getAttribute('type') == 'button'){ //добавление админа, вставка поля ввода
            let taskInput = document.createElement('input');
            taskInput.classList.add("input-task");
            taskColumn.append(taskInput);
            taskInput.addEventListener('focusout', function (event) { //обработчик потери фокуса строки ввода
                
                let task = saveTaskInColumn(taskColumn, null);
                if (task.innerHTML != ""){
                    const testTask = new User(task.innerHTML.slice(0,task.innerHTML.indexOf("/")), 
                    task.innerHTML.slice(task.innerHTML.indexOf("/")+1), "users");
                    User.save(testTask);
                }
                addBtn.setAttribute('type', 'button');
                addBtn.textContent = 'Add';
            });
            addBtn.setAttribute('type', 'submit');
            addBtn.textContent = 'Submit';
        } else { //запись задачи в localstorage
            let task = saveTaskInColumn(taskColumn, null);
            if (task.innerHTML != ""){
                const testTask = new User(task.innerHTML.slice(0,task.innerHTML.indexOf("/")), 
                task.innerHTML.slice(task.innerHTML.indexOf("/")+1), "admins");
                User.save(testTask);
            }
            
            addBtn.setAttribute('type', 'button');
            addBtn.textContent = 'Add';
        }
    };
    
    return true;
};