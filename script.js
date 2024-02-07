// app script URL
const AppScriptUrl =
  "https://script.google.com/macros/s/AKfycbyYkoQ_pWYOy1gOlDTZFpcq1Updnl3kaVeIuwxEyRuvmJ5EfOWAm1Q2hPENBkwqNKhvZA/exec";

// modal windows that will be displayed ...
const modalMassDetail = document.getElementById("modal-mass-detail");
const dayDetailModal = document.getElementById("modal-day-detail");
const intenceCreationModal = document.getElementById("modal-intence-creation");

const monthTitle = document.getElementById("month-name");

const monthNames = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];

// variable storing the intence data in JSON
let calendarData = {};

// first date - the month is set according to that
const calendarCurrentDisplayedDate = new Date();
const today = new Date();

let password = null;

// load calendar for the first time
document.addEventListener("DOMContentLoaded", async function () {
  // then continue displaying current month
  let month = calendarCurrentDisplayedDate.getMonth();
  let year = calendarCurrentDisplayedDate.getFullYear();

  enableCalendarControlArrows(false);

  let repeat = true;
  while (repeat) {
    repeat = false;
    // firstly get password
    password = prompt("Enter password:");

    await getData("month", year, month).then((monthData) => {
      // check received data and make while cycle for possibility of wrong password
      if (monthData["error_msg"] && monthData["code"]) {
        if (monthData["code"] != 200) {
          alert(monthData["error_msg"]);
          // when wrong password has been passed, then ask for the right one
          if (monthData["code"] == 310) {
            repeat = true;
          }
        }
      }

      if (!repeat) {
        // add got data to the global structure of all calendar data loaded so far
        if (calendarData[year]) calendarData[year][month] = monthData;
        else {
          calendarData[year] = {};
          calendarData[year][month] = monthData;
        }

        console.log(calendarData);
        renderCalendar(year, month, monthData);

        enableCalendarControlArrows(true);
      }
    });
    
  }
  // change month title
  monthTitle.textContent = monthNames[month].toString() + " " + year.toString();
});

function enableCalendarControlArrows(enable) {
  let arrowLeft = document.getElementById("cal-control-arrow-left");
  let arrowRight = document.getElementById("cal-control-arrow-right");

  if (enable) {
    arrowLeft.hidden = false;
    arrowRight.hidden = false;
  } else {
    arrowLeft.hidden = true;
    arrowRight.hidden = true;
  }
}

/**
 *
 * @param {*} year date in month that will be displayed (rendered)
 * @param {*} month date in month that will be displayed (rendered)
 * @param {*} monthData intence data of desired month that will be displayed
 */
function renderCalendar(year, month, monthData) {
  let container = document.getElementById("cal-cont");
  // redraw just the head row with day names
  container.innerHTML =
    '<div class="dayName">PO</div>' +
    '<div class="dayName">ÚT</div>' +
    '<div class="dayName">ST</div>' +
    '<div class="dayName">ČT</div>' +
    '<div class="dayName">PÁ</div>' +
    '<div class="dayName">SO</div>' +
    '<div class="dayName red-color">NE</div>';

  let firstDayOfMonth = getFirstDayOfMonth(year, month);

  // load days before
  // get last day of the previous month
  let lastDayOfPreivousMonth = new Date(year, month, 0).getDate();

  for (let i = weekDayFromMonday(firstDayOfMonth.getDay()) - 1; i >= 0; i--) {
    let day = document.createElement("div");
    day.innerHTML = "";
    day.innerHTML += `
        <div class='cell-column'>
            <div class='day-cell-number'>${lastDayOfPreivousMonth - i}</div>
        </div>
        `;
    day.className = "dateDay out-month-day";
    container.appendChild(day);
  }

  // load days for selected month
  let lastDayOfCurrentMonth = getLastDayOfMonth(year, month).getDate();
  for (
    let processed_day_number = 1;
    processed_day_number <= lastDayOfCurrentMonth;
    processed_day_number++
  ) {
    let day = document.createElement("div");
    day.className = "dateDay";
    // make current day selected
    // its necessary to compare dates as strings, because the time changes ...
    // (so you have to ensure you didn't compare times)
    let is_today = false;
    if (
      processed_day_number == new Date().getDate() &&
      calendarCurrentDisplayedDate.toDateString() == new Date().toDateString()
    ) {
      day.className += " today ";
      is_today = true;
    }

    // build html for the day number in cell
    day.innerHTML = "";
    day.innerHTML += `
        <div class='cell-column'>
            <div class='day-cell-number'>${processed_day_number}</div>
        </div>
        `;

    let is_free = false;
    let is_occupied = false;
    // build html for the masses displayed inside the cell
    let mass_cell_table_html = "";
    mass_cell_table_html += `<div class='cell-column'>`;
    // now fill the cell with masses that are there
    // find the date data in calendarData and build the table

    for (let intence_day in monthData) {
      let day_record = monthData[intence_day];
      if (day_record["dateDay"] == processed_day_number) {
        if (day_record["massTime"] && day_record["intentionText"] != "") {
          // mass is with intention already
          mass_cell_table_html += `<div class="calendar-cell-mass-time-occupied">${day_record["massTime"]}</div>`;
          is_occupied = true;
        } else {
          // mass is free and ready for intention
          is_free = true;
          mass_cell_table_html += `<div class="calendar-cell-mass-time-free">${day_record["massTime"]}</div>`;
        }
      }
    }

    mass_cell_table_html += `</div>`;
    day.innerHTML += mass_cell_table_html;

    // for mobile devices, make the background color appropriate according to the mass occupiation
    // there will be three possible colors of the cell according to the day's mass occupation
    if (!is_today) {
      if (is_free && !is_occupied) {
        day.className += " cell-bg-color-free ";
      } else if (is_occupied && !is_free) {
        day.className += " cell-bg-color-occupied ";
      } else if (is_free && is_occupied) {
        day.className += " cell-bg-color-mix ";
      }
    }

    day.addEventListener(
      "click",
      () => {
        dayClick(processed_day_number);
      },
      false
    );
    container.appendChild(day);
  }
}

// this function serves as modifier of the day of the week that returns sunday as 6 and monday as 0
function weekDayFromMonday(day) {
  return day == 0 ? 6 : day - 1;
}

function dayClick(day) {
  dayDetailModal.style.display = "grid";
  let clickedDayYear = calendarCurrentDisplayedDate.getFullYear();
  let clickedDayMonth = calendarCurrentDisplayedDate.getMonth();

  // set the date (day number and month name)
  let massDateDiv = document.getElementById("mass-date");
  massDateDiv.textContent =
    day.toString() +
    ". " +
    monthNames[calendarCurrentDisplayedDate.getMonth()].toString();

  // set the mass table - now just remove if there was something
  let massTitleDiv = document.getElementById("mass-title");
  massTitleDiv.textContent = "";
  let titleIsSet = false;

  // create the table with masses
  let massTable = document.getElementById("mass-table");
  massTable.innerHTML = "";

  // find the date data in calendarData and build the table
  if (calendarData[clickedDayYear]) {
    if (calendarData[clickedDayYear][clickedDayMonth]) {
      // this variable serves here for store the day_record, that includes the general information for records, that are within one day and thus have merged this info
      let recordWithGeneralInfo = null;
      // go through all days in this month
      for (let intence_day in calendarData[clickedDayYear][clickedDayMonth]) {
        // select the day data, cause the intence_day is only index of the day in month data
        let day_record =
          calendarData[clickedDayYear][clickedDayMonth][intence_day];
        // check whether the record belongs to the selected day
        if (day_record["dateDay"] == day) {
          // first set the title, if it wasn't set yet
          if (!titleIsSet) {
            massTitleDiv.textContent = day_record["dayNotation"];
            titleIsSet = true;
          }
          if (day_record["intentionText"] != "") {
            // mass is with intention already --> display as OCCUPIED
            let day_record_tbpassed = JSON.stringify(day_record); // necessary to be able to pass the data to the function
            massTable.innerHTML += `<div class="mass-time mass-occupied" onclick='showMassDetail(${day_record_tbpassed})'>${day_record["massTime"]}</div>`;
          } else {
            // mass is free and ready for intention --> display as FREE
            let day_record_tbpassed = JSON.stringify(day_record); // necessary to be able to pass the data to the function
            massTable.innerHTML += `<div class="mass-time mass-free" onclick='createMassIntence(${day_record_tbpassed})'>${day_record["massTime"]}</div>`;
          }
        }
      }
    }
  }
}

function showMassDetail(day_record) {
  dayDetailModal.style.display = "none";
  modalMassDetail.style.display = "grid";

  let modalMassDetailContent = document.getElementById(
    "modal-mass-detail-content"
  );
  modalMassDetailContent.innerHTML = `
        <div class='detail-item'>Den v týdnu:   ${day_record["day"]}</div>
        <div class='detail-item'>Označení dne:  ${day_record["dayNotation"]}</div>
        <div class='detail-item'>Čas mše:       ${day_record["massTime"]}</div>
        <div class='detail-item'>Text intence:  ${day_record["intentionText"]}</div>
        <div class='detail-item'>Kdo objednal:  ${day_record["whoOrdered"]}</div>
        <div class='detail-item'>Kontakt:       ${day_record["phoneContact"]}</div>
        <div class='detail-item'>Částka:        ${day_record["money"]}</div>
        <div class='detail-item'>Kdo zapsal:    ${day_record["whoWrite"]}</div>
    `;
}

function createMassIntence(day_record) {
  dayDetailModal.style.display = "none";
  intenceCreationModal.style.display = "grid";

  // set the title and the date to be as header in the form
  let massDateDiv = document.getElementById("form-mass-date");
  massDateDiv.textContent =
    day_record["dateDay"].toString() + day_record["dateMonth"].toString();
  let massTitleDiv = document.getElementById("form-mass-title");
  massTitleDiv.textContent =
    day_record["dayNotation"].toString() + "\n" + day_record["massTime"];

  // add function to submit button
  let btn = document.getElementById("intentionSubmitBtn");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    sendIntention(day_record);
  });
}

async function sendIntention(day_record) {
  // get info from the inputs
  let txtIntention = document.getElementById("txtIntention").value;
  let whoOrdered = document.getElementById("whoOrdered").value;
  let phoneContact = document.getElementById("phoneContact").value;
  let amount = document.getElementById("amount").value;
  let whoWrite = document.getElementById("whoWrite").value;

  // TODO check the inputs

  // pass the info to the final json
  let data = {
    password: password,
    day: day_record["day"],
    dateDay: day_record["dateDay"],
    dateMonth: day_record["dateMonth"],
    dayYear: day_record["dateYear"],
    dayNotation: day_record["dayNotation"],
    massTime: day_record["massTime"],
    intentionText: txtIntention,
    whoOrdered: whoOrdered,
    phoneContact: phoneContact,
    money: amount,
    whoWrite: whoWrite,
  };

  try {
    await fetch(AppScriptUrl, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then(async (json) => {
        console.log(json["code"]);

        if (json["code"] == 200) {
          alert("Intence zapsana!");
          // re-render current month and also reset data with updated day
          let month = calendarCurrentDisplayedDate.getMonth();
          let year = calendarCurrentDisplayedDate.getFullYear();

          await getData("month", year, month).then((monthData) => {
            //save new data
            calendarData[year][month] = monthData;
            // render calendar for current date and data after data are loaded
            renderCalendar(year, month, monthData);
          });

          // change month title
          monthTitle.textContent =
            monthNames[month].toString() + " " + year.toString();

          // close the modal
          closeIntenceCreationModal();
        } else {
          alert(json["error_msg"]);
        }
      });
  } catch (error) {
    console.error("Error:", error);
  }
}

function closeIntenceCreationModal() {
  intenceCreationModal.style.display = "none";
  dayDetailModal.style.display = "grid";
}

function closeDayModal() {
  dayDetailModal.style.display = "none";
}

function closeDetailModal() {
  modalMassDetail.style.display = "none";
  dayDetailModal.style.display = "grid";
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1);
}

function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

async function moveToPrevMonth() {
  // change the date which is main for selecting the rendered month
  calendarCurrentDisplayedDate.setMonth(
    calendarCurrentDisplayedDate.getMonth() - 1
  );

  let year = calendarCurrentDisplayedDate.getFullYear();
  let month = calendarCurrentDisplayedDate.getMonth();
  let dataLoaded = false;

  if (calendarData[year]) {
    if (calendarData[year][month]) {
      dataLoaded = true;
    }
  }

  if (!dataLoaded) {
    enableCalendarControlArrows(false);
    await getData("month", year, month).then((data) => {
      monthData = data;
      if (calendarData[year]) {
        calendarData[year][month] = data;
      } else {
        calendarData[year] = { month: data };
      }
      enableCalendarControlArrows(true);
    });
  }
  console.log("rendering prev month");
  renderCalendar(year, month, calendarData[year][month]);

  // change the month title
  monthTitle.textContent = monthNames[month].toString() + " " + year.toString();
}

async function moveToNextMonth() {
  // change the date which is main for selecting the rendered month
  calendarCurrentDisplayedDate.setMonth(
    calendarCurrentDisplayedDate.getMonth() + 1
  );

  let year = calendarCurrentDisplayedDate.getFullYear();
  let month = calendarCurrentDisplayedDate.getMonth();
  let dataLoaded = false;

  if (calendarData[year]) {
    if (calendarData[year][month]) {
      dataLoaded = true;
    }
  }

  if (!dataLoaded) {
    enableCalendarControlArrows(false);
    await getData("month", year, month).then((data) => {
      monthData = data;
      if (calendarData[year]) {
        calendarData[year][month] = data;
      } else {
        calendarData[year] = { month: data };
      }
      enableCalendarControlArrows(true);
    });
  }

  console.log("rendering next month");

  renderCalendar(year, month, calendarData[year][month]);

  // change the month title
  monthTitle.textContent = monthNames[month].toString() + " " + year.toString();
}

async function getData(period, year, month) {
  url =
    AppScriptUrl +
    "?" +
    new URLSearchParams({
      password: password,
      period: period,
      year: year,
      month: month,
    });

  let data = null;
  await fetch(url)
    .then((response) => response.json())
    .then((json) => {
      data = json;
    });

  return data;
}
