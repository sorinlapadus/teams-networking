import "./style.css";
console.warn("Starting app...");

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
    }
  });
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
initEvents();
loadTeams();
