import "./style.css";
console.warn("Starting app...");

let allTeams = [];
let teamEditId = null;

function $(selector) {
  return document, document.querySelector(selector);
}

function getTeamAsHTML(team) {
  return `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.name}</td>
    <td>${team.url}</td>
    <td>
    <a data-id="${team.id}" class="remove-btn">x</a>
    <a data-id="${team.id}" class="edit-btn">&#9998;</a>
    </td>
    </tr>`;
}

function onSubmit(e) {
  e.preventDefault();
  console.warn("onSubmit", e);
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("#name").value;
  const url = $("#url").value;
  const team = { promotion: promotion, members: members, name: name, url: url };

  if (teamEditId) {
    team.id = teamEditId;
    updateTeamRequest(team).then(status => {
      if (status.success) {
        window.location.reload();
      }
    });
  } else {
    createTeamRequest(team).then(status => {
      if (status.success) {
        window.location.reload();
      }
    });
  }
}

function initEvents() {
  const tbody = $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      console.warn("will remove %o", id);
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          console.warn("delete done", status);
          loadTeams();
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      console.warn("will update %o", id);
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
}

function displayTeams(teams) {
  const teamsHTML = teams.map(getTeamAsHTML);
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(r => r.json())
    .then(teams => {
      allTeams = teams;
      displayTeams(teams);
    });
}

function deleteTeamRequest(id) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id })
  }).then(r => r.json());
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function createTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function startEdit(id) {
  console.warn("startEdit", id);
  const team = allTeams.find(team => team.id == id);
  console.warn(team);
  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("#name").value = team.name;
  $("#url").value = team.url;
  teamEditId = id;
}

initEvents();
loadTeams();
