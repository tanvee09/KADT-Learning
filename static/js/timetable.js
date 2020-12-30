const form = {}
form.starttimeInp = document.querySelector("#starttime");
form.endtimeInp = document.querySelector("#endtime");
form.taskInp = document.querySelector("#task");
form.dayName = document.querySelector("#dayName");

var sessions = [];
const tasks = document.querySelector("#schedule");

// printing the current date
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const dateObj = new Date();

function setCurrDay() {
    var currDay = document.getElementById('dayNumber').innerHTML;
    document.getElementById('displayDate').innerHTML = String(dayNames[currDay]);
    if (dateObj.getDay() == currDay) {
        document.getElementById('displayDate').style.textDecoration = 'underline';
        document.getElementById('displayDate').style.color = '#fa7952';
    } else {
        document.getElementById('displayDate').style.color = '#abada9';
    }
}

function nextDay() {
    var currDay = parseInt(document.getElementById('dayNumber').innerHTML);
    currDay = (currDay + 1) % 7;
    document.getElementById('newDay').value = currDay;
    let dateForm = document.getElementById('changeDay');
    dateForm.action = window.location.pathname;
    dateForm.submit();

}

function prevDay() {
    var currDay = parseInt(document.getElementById('dayNumber').innerHTML);
    currDay = (currDay - 1 + 7) % 7;
    document.getElementById('newDay').value = currDay;
    let dateForm = document.getElementById('changeDay');
    dateForm.action = window.location.pathname;
    dateForm.submit();
}

function compare(first, second) {
    firststart = first.getElementsByClassName("session-time")[0].innerHTML.substring(0, 5);
    secondstart = second.getElementsByClassName("session-time")[0].innerHTML.substring(0, 5);
    firststarttime = parseInt(firststart.substring(0, 2)) * 60 + parseInt(firststart.substring(3, 5));
    secondstarttime = parseInt(secondstart.substring(0, 2)) * 60 + parseInt(secondstart.substring(3, 5));
    if (firststarttime == secondstarttime) {
        return 0;
    } else if (firststarttime > secondstarttime) {
        return 1;
    } else {
        return -1;
    }
}

function overlaps(start1, end1, task) {
    start2 = task.getElementsByClassName("session-time")[0].innerHTML.substring(0, 5);
    end2 = task.getElementsByClassName("session-time")[0].innerHTML.substring(6, 11);
    firststarttime = parseInt(start1.substring(0, 2)) * 60 + parseInt(start1.substring(3, 5));
    firstendtime = parseInt(end1.substring(0, 2)) * 60 + parseInt(end1.substring(3, 5));
    secondstarttime = parseInt(start2.substring(0, 2)) * 60 + parseInt(start2.substring(3, 5));
    secondendtime = parseInt(end2.substring(0, 2)) * 60 + parseInt(end2.substring(3, 5));
    return (firststarttime < secondendtime && secondstarttime < firstendtime);
}

function addTask() {
    try {
        let starttime = form.starttimeInp.value,
            endtime = form.endtimeInp.value;

        if (!starttime || !endtime) {
            alert("Enter valid time interval!");
            return;
        }

        let startTimeValue = parseInt(starttime.substring(3, 5)) + 60 * parseInt(starttime.substring(0, 2)),
            endTimeValue = parseInt(endtime.substring(3, 5)) + 60 * parseInt(endtime.substring(0, 2));

        if (startTimeValue > endTimeValue && endTimeValue != 0) {
            alert("Enter valid time interval!");
            return;
        }

        if (!form.taskInp.value) {
            alert("Please enter some task!");
            return;
        }

        dayName.value = parseInt(document.getElementById('dayNumber').innerHTML);

        var sC = document.createElement("div"); // the sC div over the class = "session " div
        sC.classList.add('sC');
        var task = document.createElement("div");
        task.innerHTML = `<span class="session-time ">${starttime}-${endtime}</span><span class="session-track">${form.taskInp.value}</span><span class="session-delete">&times</span>`;
        task.classList.add('session');
        var color = Math.floor(Math.random() * 4 + 1);
        task.classList.add('track-' + color);
        addListenerDeleteButton(task.getElementsByClassName("session-delete")[0]);
        sC.appendChild(task);

        var children = tasks.getElementsByClassName("sC");
        taskList = [];
        var idx = children.length;
        var indexFound = false;
        for (var i = 0; i < children.length; i++) {
            if (overlaps(starttime, endtime, children[i])) {
                alert("Time interval overlaps already existing task!");
                return;
            } else if (!indexFound && compare(task, children[i]) == -1) {
                idx = i;
                indexFound = true;
            }
            taskList.push(children[i]);
        }

        taskList.splice(idx, 0, sC); // adding at desired index

        tasks.innerHTML = "";

        for (var i = 0; i < taskList.length; i++) {
            tasks.appendChild(taskList[i]);
        }

        document.getElementById("taskForm").submit();
        form.taskInp.value = '';

    } catch (err) {
        alert(err);
    }
}

function addListenerDeleteButton(deleteButton) {
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteNote(e);
    });
}

function deleteNote(e) {
    let deleteNote = e.target.parentNode;
    let schtime = deleteNote.getElementsByClassName('session-time')[0].innerHTML;
    document.getElementById('delstarttime').value = schtime.split('-')[0];
    document.getElementById('delendtime').value = schtime.split('-')[1];
    document.getElementById('delDayName').value = parseInt(document.getElementById('dayNumber').innerHTML);
    document.getElementById('deltaskForm').submit();

    let eventNote = e.target.parentNode.parentNode;
    eventNote.parentNode.removeChild(eventNote);
}

// Highlighting current task
setInterval(async function() {
    var today = new Date();
    let time = today.getHours() * 60 + today.getMinutes();
    var children = document.getElementsByClassName("sC");
    let length = children.length;
    for (var i = 0; i < length; i++) {
        start = children[i].getElementsByClassName("session-time")[0].innerHTML.substring(0, 5);
        starttime = parseInt(start.substring(0, 2)) * 60 + parseInt(start.substring(3, 5));
        end = children[i].getElementsByClassName("session-time")[0].innerHTML.substring(6, 11);
        endtime = parseInt(end.substring(0, 2)) * 60 + parseInt(end.substring(3, 5));

        if (time >= starttime && time < endtime) {
            children[i].style.backgroundColor = "rgb(233, 233, 233)";
            children[i].style.borderColor = "black";
        } else {
            children[i].style.backgroundColor = "white";
            children[i].style.borderColor = "white";
        }
    }
}, 1000);

function deleteOrgTask(task) {
    let deleteNote = task.parentNode;
    let schtime = deleteNote.getElementsByClassName('session-time')[0].innerHTML;
    document.getElementById('delstarttime').value = schtime.split('-')[0];
    document.getElementById('delendtime').value = schtime.split('-')[1];
    document.getElementById('delDayName').value = parseInt(document.getElementById('dayNumber').innerHTML);
    document.getElementById('deltaskForm').submit();

    let eventNote = task.parentNode.parentNode;
    eventNote.parentNode.removeChild(eventNote);
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.click();
}


function saveSS() {
    var link = document.getElementById('ssOutput');
    let div = document.getElementById('schedule');
    html2canvas(div, {
        onrendered: function(canvas) {
            var myImage = canvas.toDataURL("image/png");
            downloadURI("data:" + myImage, "timetable.png");
        }
    });
}

$(document).ready(function() {
    $('#sidebarCollapse').on('click', function() {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });
});


function shareTT() {
    userid = document.getElementById('userid').innerHTML;
    let url = 'http://localhost:3000/' + 'viewtimetable/' + userid;
    let urlshare = document.getElementById('urlshare');
    urlshare.innerHTML = `Share this url: <a href='${url}'>${url}</a>`;
    console.log('here');
}

function useTT() {
    document.getElementById('useschedule').action += '/' + document.getElementById('userid').innerHTML;
    document.getElementById('useschedule').submit();
}