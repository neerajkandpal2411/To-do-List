// Define variables for the UI
const formButton = document.querySelector("#task-form");
const taskList = document.querySelector(".collection");
const clearBtn = document.querySelector(".clear-tasks");
const filter = document.querySelector("#filter");
const taskInput = document.querySelector("#task");

// To add basic voice assistance in the app
const speech = new SpeechSynthesisUtterance();
speech.voice = window.speechSynthesis.getVoices()[0];

// Loading all event listeners to handle different features and cases
loadEventListeners();

function loadEventListeners() {
  // DOM load event
  document.addEventListener("DOMContentLoaded", getTasks);
  // Event for adding task
  formButton.addEventListener("submit", addTask);
  // Event for removing tasks
  taskList.addEventListener("click", removeTask);
  // Event for clearing all the tasks
  clearBtn.addEventListener("click", clearTasks);
  //Event for filtering/searching tasks
  filter.addEventListener("keyup", filterTasks);
}

/* 
Feature #1: Showing all the tasks added by the user

We're using localStorage of the browser to stora the taskList so that
	the tasks persist even if the user leaves the page..
*/
function getTasks() {
  let tasks;

  //Checking if there's any task in the localStorage
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks")); //get all the tasks in localStorage
  }

  tasks.forEach(function (task) {
    // Create task list
    const li = document.createElement("li");
    li.className = "collection-item";
    li.appendChild(document.createTextNode(task));

    // Adding option to remove the task by the user
    const link = document.createElement("a");
    link.className = "delete-item secondary-content";
    link.innerHTML = `<i class="fas fa-trash"></i>`;
    li.appendChild(link);
    taskList.appendChild(li);
  });
}

/**
 * Feature #2: The user should be able to add task
 * this is handled by the eventListener on the "Add task" button's "submit" event
 *
 * Note: there will be an alert if the user tries to add an empty task
 */
function addTask(e) {
  if (taskInput.value === "") {
    alert("Please add a task!!!");
    return;
  }
  // Create task list
  const li = document.createElement("li");
  li.className = "collection-item";
  li.appendChild(document.createTextNode(taskInput.value));
  // Create task delete icon for this task
  const link = document.createElement("a");
  link.className = "delete-item secondary-content";
  link.innerHTML = `<i class="fas fa-trash"></i>`;
  li.appendChild(link);
  taskList.appendChild(li);

  // Store in local storage
  saveToLocalStorage(taskInput.value);

  // Give confirmation using voice assistance
  speech.text = `New task added, ${taskInput.value}`;
  window.speechSynthesis.speak(speech);

  //Clear input once the task is successfully added to localStorage
  taskInput.value = "";
  e.preventDefault(); // this is to handle the default behaviour of the "submit" event (reference: http://tinyurl.com/preventDefaultExample)
}

/* Storing the tasks in local storage
 * if there're existing tasks in the LS, append the new task to the list, else create a new array and add the new task to LS
 */
function saveToLocalStorage(task) {
  let tasks;
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/*
* Feature #3: Remove tasks using the delete icon along with the task

* Removing tasks is done in 2 steps:
- first, remove it from the list shown in the UI
- second, remove it from the localStorage using the removeFromLocalStorage(item) method
*/
function removeTask(e) {
  if (e.target.parentElement.classList.contains("delete-item")) {
    let itemToDel = e.target.parentElement.parentElement;
    itemToDel.remove();
    // Remove task from Local storage
    removeFromLocalStorage(itemToDel);

    // Give confirmation using voice assistance
    speech.text = `Task removed, ${itemToDel.textContent}`;
    window.speechSynthesis.speak(speech);
  }
}

// Remove from Local storage
function removeFromLocalStorage(itemToDel) {
  let tasks;
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }
  tasks.forEach(function (task, index) {
    if (itemToDel.textContent === task) {
      tasks.splice(index, 1);
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/*
 * Feature #4: Clear all the tasks at once
 * - remove from the DOM(UI)
 * - remove from the localStorage
 */
function clearTasks(e) {
  // taskList.innerHTML = '';

  let allTasks = document.querySelectorAll(".collection-item");
  let shouldGiveConfirmation = false;
  if (allTasks?.length > 0) {
    shouldGiveConfirmation = true;
  }
  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }

  clearTasksFromLocalStorage();

  // Give confirmation using voice assistance
  if (shouldGiveConfirmation) {
    speech.text = `Task list cleared successfully, add new tasks!`;
    window.speechSynthesis.speak(speech);
  }
}

function clearTasksFromLocalStorage() {
  localStorage.removeItem("tasks");
}

/*
 * Feature #5: Filter tasks from the list
 * This feature is super helpful when there are a lot of tasks in the list and the user
 * wants to search for some specific tasks
 *
 * To achieve this, we check if the search string is a part of the task name or not
 * if yes, we display is, otherwise we hide it
 */
function filterTasks(e) {
  const text = e.target.value.toLowerCase();
  document.querySelectorAll(".collection-item").forEach(function (task) {
    const item = task.firstChild.textContent;
    if (item.toLowerCase().indexOf(text) !== -1) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}
