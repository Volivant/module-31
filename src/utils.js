export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  localStorage.clear();
  const testUser = new User("test", "qwerty123", "users");
  User.save(testUser);
  const testUser2 = new User("test2", "qwerty123", "users");
  User.save(testUser2);
  const testAdmin = new User("admin", "qwerty123", "admins"); // добавим администратора
  User.save(testAdmin);
};

export const generateTestTask = function (Task) {
  const testTask = new Task("task-1", "test");
  Task.save(testTask);
  const testTask2 = new Task("task-2", "test");
  Task.save(testTask2);
  const testTask3 = new Task("task-3", "test2");
  Task.save(testTask3);
};
