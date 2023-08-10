import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import userFieldTemplate from "./templates/userField.html";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { generateTestUser } from "./utils";
import { generateTestTask } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { getTaskList, getDrag, addTaskBacklog, addTaskReady, saveTaskList} from "./services/taskOperations";
import { getUsersList, saveUsersList, addAdmin, addUser } from "./services/userOperations";


export const appState = new State(); //текущий юзер

const loginForm = document.querySelector("#app-login-form");

const btn = document.querySelector('.navbar-toggler');
const btn_svg1 = document.querySelectorAll('.bi')[0];
const btn_svg2 = document.querySelectorAll('.bi')[1];

btn.addEventListener('click', () => {
	btn_svg1.classList.toggle('svg--off');
  btn_svg2.classList.toggle('svg--off');
});

const dropdown = document.querySelector('.dropdown');
dropdown.onclick = function(){
  dropdown.classList.toggle('active')
}

//функция выхода
const menuLogOut = document.querySelector('.option-logout');
menuLogOut.onclick = function(){
  document.querySelector(".container-board").innerHTML = "<p>Please Sign In to see your tasks!</p>";
  document.querySelector(".navbar-toggler").style.display = "none";
  document.querySelector(".btn-login").style.display = "inline-block";
  let elements = document.querySelectorAll('.form-control');
  for (let elem of elements) {
    elem.style.display = "block";
  }
}

//функция сохранения данных
const menuSave = document.querySelector('.option-save');
menuSave.onclick = function(){
  saveTaskList();
}

//функция сохранения данных
const menuSaveUsers = document.querySelector('.option-save-users');
menuSaveUsers.onclick = function(){
  saveUsersList();
}

//функция администрирования пользователей
const menuUsers = document.querySelector('.option-users');
menuUsers.onclick = function(){
  //подключаем поле администрирования пользователей
  if (appState.currentUser.role == "admins") { // проверка роли пользователя
    document.querySelector(".container-board").innerHTML = userFieldTemplate;
    // загрузка списка пользователей
    getUsersList();
    addAdmin();
    addUser();
    //запуск перетакивания
    getDrag();
  }
}

//функция администрирования задач
const menuTasks = document.querySelector('.option-tasks');
menuTasks.onclick = function(){
  //подключаем поле администрирования задач
  document.querySelector(".container-board").innerHTML = taskFieldTemplate;
  document.querySelector(".navbar-toggler").style.display = "block";
  document.querySelector(".btn-login").style.display = "none";
  let elements = document.querySelectorAll('.form-control');
  for (let elem of elements) {
    elem.style.display = "none";
  }
  //загрузка списка задач
  getTaskList();
  addTaskBacklog();
  addTaskReady(".btn-ready", ".card-backlog", ".card-ready");
  addTaskReady(".btn-progress", ".card-ready", ".card-progress");
  addTaskReady(".btn-finished", ".card-progress", ".card-finished");
  //запуск перетакивания
  getDrag();
  //обновление данных футера
  document.onmousemove = function() {
    const numberActiveTask = document.querySelector(".card-ready");
    document.querySelector(".active-task").innerHTML = "Active task: " + numberActiveTask.childElementCount;
    const numbeFinishedTask = document.querySelector(".card-finished");
    document.querySelector(".finished-task").innerHTML = "Finished task: " + numbeFinishedTask.childElementCount;
  }
}

generateTestUser(User);

generateTestTask(Task);

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  if (authUser(login, password)){
    menuTasks.onclick();
    
  } else {
    alert("В доступе отказано!");
  }
});


