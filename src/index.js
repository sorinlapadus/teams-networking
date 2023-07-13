import "./style.css";
import { $, $$, filterElements, mask, unmask, sleep, debounce, checkAll } from "./utilities";
import { loadTeamsRequest, deleteTeamRequest, createTeamRequest } from "./middleware";
//import debounce from "lodash/debounce";
//import * as middleware from "./middleware";
console.warn("Starting app...");

let allTeams = [];
let teamEditId = null;

const form = "#teamsForm";

function getTeamAsHTML({ id, url, promotion, members, name }) {
  return `<tr>
    <td style='text-align: center'>
      <input type='checkbox' name='selected' value=${id}>
    </td>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${url}</a></td>
    <td>
      <button type='button' data-id="${id}" class="action-btn edit-btn">&#9998;</button>
      <button type='button' data-id="${id}" class="action-btn remove-btn">&#x2672</button>
    </td>
  </tr>`;
}

function getTeamAsHTMLInputs({ id, url, promotion, members, name }) {
  return `<tr>
    <td style='text-align: center'>
      <input type='checkbox' name='selected' value=${id}>
    </td>
    <td>
      <input type="text" value="${promotion}" name="promotion" placeholder="Enter promotion" required />
    </td>
    <td>
      <input type="text" value="${members}" name="members" placeholder="Enter members" required />
    </td>
    <td>
      <input type="text" value="${name}" name="name" placeholder="Enter project name" required />
    </td>
    <td>
      <input type="text" value="${url}" name="url" placeholder="Enter project URL" required />
    </td>
    <td>
      <button type="submit" class='action-btn'>💾</button>
      <button type="reset" class='action-btn'>✖</button>
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

async function removeSelected() {
  mask(form);
  const selected = $$("input[name=selected]:checked");
  const ids = [...selected].map(input => input.value);
  const promises = ids.map(id => deleteTeamRequest(id));
  promises.push(sleep(2000));
  const statuses = await Promise.allSettled(promises);
  await loadTeams();
  unmask(form);
}

function initEvents() {
  $("#selectAll").addEventListener("click", e => {
    console.warn(e.target.checked);
    checkAll("input[name=selected]", e.target.checked);
  });
  $("#removeSelected").addEventListener(
    "click",
    debounce(() => {
      removeSelected();
    }, 1000)
  );
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches(".remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id, async ({ success }) => {
        if (success) {
          await loadTeams();
          unmask(form);
        }
      });
    } else if (e.target.matches(".edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    teamEditId = undefined;
  });

  $("#searchTeams").addEventListener(
    "input",
    debounce(function (e) {
      const searchText = e.target.value;
      const filteredTeams = filterElements(allTeams, searchText);
      displayTeams(filteredTeams);
    }, 400)
  );
}

let previewDisplayTeams = [];
function displayTeams(teams, teamEditId) {
  if (!teamEditId && teams === previewDisplayTeams) {
    console.warn("displayTeams: no need to display, same teams");
    return;
  }
  if (!teamEditId && teams.length === previewDisplayTeams.length) {
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
  const teamsHTML = teams.map(t => (t.id === teamEditId ? getTeamAsHTMLInputs(t) : getTeamAsHTML(t)));
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
  teamEditId = id;
  //const team = allTeams.find(team => team.id == id);
  //setTeamValues(team);
  displayTeams(allTeams, id);
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
