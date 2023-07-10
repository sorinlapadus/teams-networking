import "./style.css";
import { $, filterElements, mask, unmask, sleep } from "./utilities";
import { loadTeamsRequest, deleteTeamRequest, createTeamRequest } from "./middleware";
//import * as middleware from "./middleware";
console.warn("Starting app...");

let allTeams = [];
let teamEditId = null;
const form = "#teamsForm";
function getTeamAsHTML({ id, url, promotion, members, name }) {
  return `<tr>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${url}</a></td>
    <td>
    <a data-id="${id}" class="remove-btn">x</a>
    <a data-id="${id}" class="edit-btn">&#9998;</a>
    </td>
    </tr>`;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("#name").value;
  const url = $("#url").value;
  return { promotion: promotion, members: members, name: name, url: url };
}

async function onSubmit(e) {
  e.preventDefault();
  const team = getTeamValues();
  let status;
  if (teamEditId) {
    team.id = teamEditId;
    console.time("update");
    status = await updateTeamRequest(team);
    console.timeEnd("update");
    if (status.success) {
      allTeams = allTeams.map(t => {
        if (t.id === teamEditId) {
          return { ...t, ...team };
        }
        return t;
      });
    }
  } else {
    status = await createTeamRequest(team);
    if (status.success) {
      team.id = status.id;
      allTeams = [...allTeams, team];
    }
  }

  if (status.success) {
    displayTeams(allTeams);
    $("#teamsForm").reset();
    unmask(form);
  }
}

function initEvents() {
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id, async ({ success }) => {
        if (success) {
          await loadTeams();
          unmask(form);
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    teamEditId = undefined;
  });

  let timer;

  function debounce(fn, msec) {
    return function (e) {
      //console.warn("searching...", e.target.value);
      clearTimeout(timer);
      setTimeout(function () {
        fn(e);
      }, msec);
    };
  }

  $("#searchTeams").addEventListener(
    "input",
    debounce(e => {
      const searchText = e.target.value;
      const filteredTeams = filterElements(allTeams, searchText);
      displayTeams(filteredTeams);
    }, 400)
  );
}

let previewDisplayTeams = [];
function displayTeams(teams) {
  if (teams === previewDisplayTeams) {
    console.warn("displayTeams: no need to display, same teams");
    return;
  }
  if (teams.length === previewDisplayTeams.length) {
    if (
      teams.every((team, i) => {
        return team === previewDisplayTeams[i];
      })
    ) {
      console.warn("displayTeams: no need to display, same content");
      return;
    }
  }
  previewDisplayTeams = teams;
  const teamsHTML = teams.map(getTeamAsHTML);
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  return loadTeamsRequest().then(teams => {
    allTeams = teams;
    displayTeams(teams);
    return allTeams;
  });
}

function setTeamValues(team) {
  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("#name").value = team.name;
  $("#url").value = team.url;
}

function startEdit(id) {
  const team = allTeams.find(team => team.id == id);
  setTeamValues(team);
  teamEditId = id;
}

(async () => {
  console.warn("start sleep");
  await sleep(2000);
  console.warn("ready to do %o", "next job");
})();

(async () => {
  mask(form);
  await sleep(5000);
})();

initEvents();

(async () => {
  //loadTeams().then(() => {
  // $("#teamsForm").classList.remove("loading-mask");
  //});
  await loadTeams();
  unmask(form);
})();
