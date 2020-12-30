google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

  var data = [];

  var history = document.getElementById('history').getElementsByTagName('p');
  data.push(["Website", "Minutes"]);
  try{
    var totaltime = 0;
    for (i of history) {
      var link = i.innerHTML.split('!')[0].replace(/\|/g, '.');
      var time = parseFloat(i.innerHTML.split('!')[1]);
      totaltime += time;
      data.push([link, time]);
    }

    var bars = document.getElementById('bars');
    for (i of history) {
      var link = i.innerHTML.split('!')[0].replace(/\|/g, '.');
      var time = parseFloat(i.innerHTML.split('!')[1]);
      let perc = 100 * time / totaltime;
      var desc = document.createElement('table');
      desc.classList.add('timespenttable');
      desc.innerHTML = `<tr><td style="width: 70%;">${link}</td><td style="width: 30%;">${time.toFixed(2)} minutes</td></tr>`
      var elt = document.createElement('div');
      elt.classList.add('progress');
      elt.innerHTML = `<div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="${perc}" aria-valuemin="0" aria-valuemax="100" style="width:${perc}%; background-color: #7386D5;"><span class="sr-only">${perc}% Complete</span></div>`;
      bars.appendChild(desc);
      bars.appendChild(elt);
      bars.appendChild(document.createElement('br'));
    }
    console.log(data);
  }catch(err) {
    alert(err);
  }

  // data = google.visualization.arrayToDataTable([
  //   ['Task', 'Hours per Day'],
  //   ['Work',     11],
  //   ['Eat',      2],
  //   ['Commute',  2],
  //   ['Watch TV', 2],
  //   ['Sleep',    7]
  // ]);
  data = google.visualization.arrayToDataTable(data);

  var options = {
    title: ''
  };

  var chart = new google.visualization.PieChart(document.getElementById('piechart'));

  chart.draw(data, options);
}