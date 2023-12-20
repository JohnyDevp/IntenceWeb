// modal windows that will be displayed ... 
const modalMassDetail = document.getElementById('modal-mass-detail')
const dayDetailModal = document.getElementById("modal-day-detail");
const intenceCreationModal = document.getElementById('modal-intence-creation')

const monthTitle = document.getElementById('month-name')

const monthNames = ['Leden', 'Únor', 'Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']

// variable storing the intence data in JSON
let calendarData = null

// first date - the month is set according to that
const calendarCurrentDisplayedDate = new Date();
const today = new Date();

// load calendar for the first time
document.addEventListener("DOMContentLoaded", function () { 
    let month = calendarCurrentDisplayedDate.getMonth()
    let year = calendarCurrentDisplayedDate.getFullYear()
    
    getData().then ( () => {
        // render calendar for current date and data after data are loaded
        renderCalendar(year, month, calendarData)
    })

    // change month title
    monthTitle.textContent = monthNames[month].toString() + ' ' + year.toString()
});

/**
 * 
 * @param {*} date date in month that will be displayed (rendered)
 */
function renderCalendar(year, month, data) {
    let container = document.getElementById('cal-cont')
    // redraw just the head row with day names
    container.innerHTML = '<div class="dayName">PO</div>' +
        '<div class="dayName">ÚT</div>' +
        '<div class="dayName">ST</div>' +
        '<div class="dayName">ČT</div>' +
        '<div class="dayName">PÁ</div>' +
        '<div class="dayName">SO</div>' +
        '<div class="dayName red-color">NE</div>'

    let firstDayOfMonth = getFirstDayOfMonth(year, month)

    // load days before
    // get last day of the previous month
    let lastDayOfPreivousMonth = new Date(year, month, 0).getDate()
    
    for (let i = weekDayFromMonday(firstDayOfMonth.getDay()) - 1; i >= 0; i--){
        let day = document.createElement('div')
        day.innerHTML = ''
        day.innerHTML += `
        <div class='cell-column'>
            <div class='day-cell-number'>${lastDayOfPreivousMonth - i}</div>
        </div>
        `
        day.className = 'dateDay out-month-day'
        container.appendChild(day)
    }
    
    // load days after
    let lastDayOfCurrentMonth = getLastDayOfMonth(year, month).getDate()
    for (let i = 1; i<=lastDayOfCurrentMonth; i++)
    {
        let day = document.createElement('div')
        day.className = 'dateDay'
        // make current day selected
        // its necessary to compare dates as strings, because the time changes ... 
        // (so you have to ensure you didn't compare times)
        if (i == (new Date()).getDate() && calendarCurrentDisplayedDate.toDateString() == (new Date()).toDateString()){
            day.className += ' today '
        }

        // build html for the day number in cell
        day.innerHTML = ''
        day.innerHTML += `
        <div class='cell-column'>
            <div class='day-cell-number'>${i}</div>
        </div>
        `

        // build html for the masses displayed inside the cell
        let mass_cell_table_html = ''
        mass_cell_table_html += `<div class='cell-column'>`
        // now fill the cell with masses, that are there
        // find the date data in calendarData and build the table
        let cellDayYear = calendarCurrentDisplayedDate.getFullYear()
        let cellDayMonth = calendarCurrentDisplayedDate.getMonth()
        if (calendarData[cellDayYear]){
            if (calendarData[cellDayYear][cellDayMonth]){
                for (let intence_day in calendarData[cellDayYear][cellDayMonth]){
                    let day_record = calendarData[cellDayYear][cellDayMonth][intence_day]
                    if (day_record['dateDay'] == i) {
                        if (day_record['massTime'] && day_record['intentionText'] != ''){
                            // mass is with intention already
                            mass_cell_table_html+= `<div class="calendar-cell-mass-time-occupied">${day_record['massTime']}</div>`
                        }
                        else
                            // mass is free and ready for intention
                            mass_cell_table_html += `<div class="calendar-cell-mass-time-free">${day_record['massTime']}</div>` 
                    }
                }
            }
        }
        mass_cell_table_html += `</div>`
        day.innerHTML += mass_cell_table_html

        day.addEventListener('click', () => {
            dayClick(i)
        }, false)
        container.appendChild(day)
    }
}

// this function serves as modifier of the day of the week that returns sunday as 6 and monday as 0
function weekDayFromMonday(day){
    return day == 0 ? 6 : day - 1
}

function dayClick(day) {
    dayDetailModal.style.display = 'grid'
    let clickedDayYear = calendarCurrentDisplayedDate.getFullYear()
    let clickedDayMonth = calendarCurrentDisplayedDate.getMonth()
    
    let massDateDiv = document.getElementById('mass-date')
    massDateDiv.textContent = day.toString() + '. ' + monthNames[calendarCurrentDisplayedDate.getMonth()].toString()
    let massTitleDiv = document.getElementById('mass-title')
    let titleIsSet = false

    let massTable = document.getElementById('mass-table')
    massTable.innerHTML = ''

    // find the date data in calendarData and build the table
    if (calendarData[clickedDayYear]){
        if (calendarData[clickedDayYear][clickedDayMonth]){
            // this variable serves here for store the day_record, that includes the general information for records, that are within one day and thus have merged this info
            let recordWithGeneralInfo = null
            for (let intence_day in calendarData[clickedDayYear][clickedDayMonth]){
                let day_record = calendarData[clickedDayYear][clickedDayMonth][intence_day]
                if (day_record['dateDay'] == day) {
                    // first set the title, if it wasn't set yet
                    if(!titleIsSet){
                        massTitleDiv.textContent = day_record['dayNotation']
                        recordWithGeneralInfo = day_record
                        titleIsSet = true;
                    }
                    if (day_record['massTime'] && day_record['intentionText'] != ''){
                        // mass is with intention already 
                        let day_record_tbpassed = JSON.stringify(day_record)
                        let recordWithGeneralInfo_tbpassed = JSON.stringify(recordWithGeneralInfo)
                        console.log(day_record_tbpassed)
                        massTable.innerHTML += `<div class="mass-time mass-occupied" onclick='showMassDetail(${day_record_tbpassed}, ${recordWithGeneralInfo_tbpassed})'>${day_record['massTime']}</div>`
                    }
                    else{
                        // mass is free and ready for intention
                        let day_record_tbpassed = JSON.stringify(day_record)
                        massTable.innerHTML += `<div class="mass-time mass-free" onclick='createMassIntence(${day_record_tbpassed})'>${day_record['massTime']}</div>` 
                    }
                }
            }
        }
    }
}

function showMassDetail(day_record, recordWithGeneralInfo){
    dayDetailModal.style.display = 'none'
    modalMassDetail.style.display = 'grid' 
    
    let modalMassDetailContent = document.getElementById('modal-mass-detail-content')
    modalMassDetailContent.innerHTML = `
        <div class='detail-item'>Den v týdnu:   ${recordWithGeneralInfo['day']}</div>
        <div class='detail-item'>Označení dne:  ${recordWithGeneralInfo['dayNotation']}</div>
        <div class='detail-item'>Čas mše:       ${day_record['massTime']}</div>
        <div class='detail-item'>Text intence:  ${day_record['intentionText']}</div>
        <div class='detail-item'>Kdo objednal:  ${day_record['whoOrdered']}</div>
        <div class='detail-item'>Kontakt:       ${day_record['phoneContant']}</div>
        <div class='detail-item'>Částka:        ${day_record['money']}</div>
        <div class='detail-item'>Kdo zapsal:    ${day_record['whoWrite']}</div>
    `
}

function createMassIntence(day_record) {

}

function closeIntenceCreationModal(){

}

function closeDayModal() {
    dayDetailModal.style.display = 'none'
}

function closeDetailModal() {
    modalMassDetail.style.display = 'none'
    dayDetailModal.style.display = 'grid'
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
}

function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0);
}

function moveToPrevMonth() {
    // change the date which is main for selecting the rendered month
    calendarCurrentDisplayedDate.setMonth(calendarCurrentDisplayedDate.getMonth() - 1)
    renderCalendar(
        calendarCurrentDisplayedDate.getFullYear(),
        calendarCurrentDisplayedDate.getMonth(),
        calendarData)
    
    // change the month title
    let monthNum = calendarCurrentDisplayedDate.getMonth()
    let monthYear = calendarCurrentDisplayedDate.getFullYear()
    monthTitle.textContent = monthNames[monthNum].toString() + ' ' + monthYear.toString()
}

function moveToNextMonth() {
    // change the date which is main for selecting the rendered month
    calendarCurrentDisplayedDate.setMonth(calendarCurrentDisplayedDate.getMonth() + 1)
    renderCalendar(
        calendarCurrentDisplayedDate.getFullYear(),
        calendarCurrentDisplayedDate.getMonth(),
        calendarData)

    // change the month title
    let monthNum = calendarCurrentDisplayedDate.getMonth()
    let monthYear = calendarCurrentDisplayedDate.getFullYear()
    monthTitle.textContent = monthNames[monthNum].toString() + ' ' + monthYear.toString()
}

async function getData() {
    await fetch("https://script.google.com/macros/s/AKfycbxejDGFt2gJgt5awjllzrzoi4eb66CZQLSLZhlitPia34oK92FixIJOBJ9QUnHyGehttw/exec")
    .then(response => response.json())
    .then(json => {
        calendarData = json
        for (let x in calendarData['data'])
        {
            console.log(x)
        }
    });
}