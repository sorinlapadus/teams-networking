import "./style.css";
console.warn("Starting app...");

function $(selector) {
  return document, document.querySelector(selector);
}

function getTeamAsHTML(team) {
  return `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.projectName}</td>
    <td>${team.projectURL}</td>
    <td>
    <a class="delete-btn">x</a>
    <a class="edit-btn">&#9998;</a>
    </td>
    </tr>`;
}

function initEvents() {
  const tbody = $("#teamsTable tbody").addEventListener("click", e => {
    console.warn(e.target);
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
initEvents();
loadTeams();
