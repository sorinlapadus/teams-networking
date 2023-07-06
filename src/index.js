import "./style.css";
console.warn("Starting app...");

let allTeams = [];
let teamEditId = null;

function $(selector) {
  return document, document.querySelector(selector);
}

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
  if (teamEditId) {
    team.id = teamEditId;
    console.time("update");
    const { success } = await updateTeamRequest(team);
    console.timeEnd("update");
    if (success) {
      allTeams = allTeams.map(t => {
        if (t.id === teamEditId) {
          return { ...t, ...team };
        }
        return t;
      });
      displayTeams(allTeams);
      $("#teamsForm").reset();
    }
  } else {
    createTeamRequest(team).then(status => {
      if (status.success) {
        team.id = status.id;
        allTeams = [...allTeams, team];
        displayTeams(allTeams);
        $("#teamsForm").reset();
      }
    });
  }
}

function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(([key, value]) => {
      if (key !== "id") {
        return value.toLowerCase().includes(search);
      }
    });
  });
}

function initEvents() {
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id, async ({ success }) => {
        if (success) {
          await loadTeams();
          hideLoadingMask();
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

  $("#searchTeams").addEventListener("input", e => {
    const searchText = e.target.value;
    const filteredTeams = filterElements(allTeams, searchText);
    displayTeams(filteredTeams);
  });
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

function loadTeamsRequest() {
  return fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(r => r.json());
}

function deleteTeamRequest(id, callback) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id })
  })
    .then(r => r.json())
    .then(status => {
      if (typeof callback === "function") callback(status);
      return status;
    });
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

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async () => {
  console.warn("start sleep");
  await sleep(2000);
  console.warn("ready to do %o", "next job");
})();

(async () => {
  showLoadingMask();
  await sleep(5000);
})();

function showLoadingMask() {
  $("#teamsForm").classList.add("loading-mask");
}

function hideLoadingMask() {
  $("#teamsForm").classList.remove("loading-mask");
}

initEvents();

(async () => {
  //loadTeams().then(() => {
  // $("#teamsForm").classList.remove("loading-mask");
  //});
  await loadTeams();
  hideLoadingMask();
})();
