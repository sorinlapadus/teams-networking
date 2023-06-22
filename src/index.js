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
    <td>x &#9998;</td>
    </tr>`;
}

function displayTeams(teams) {
  const teamsHTML = teams.map(getTeamAsHTML);
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("teams.json")
    .then(r => r.json())
    .then(teams => {
      displayTeams(teams);
    });
}
loadTeams();
