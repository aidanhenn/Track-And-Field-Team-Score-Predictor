const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
// PORT
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Team Score Predictor</title>
    <style>
      body {
        background-color: #191919;
        margin: 0;
        padding: 0;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100px;
        padding: 0 20px;
      }
      
      h1 {
        color: #F0F0F0;
        font-size: 50px;
        margin: 0;
        flex-grow: 1;
        text-align: center;
        margin-right: 8%;
      }
      
      .faq {
        color: #F0F0F0;
        margin: 0;
        margin-left: 20px;
        width: 5%;
        padding: 10px;
        font-size: 1.2em;
        background-color: #6E6E6E;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .faq:hover{
        background-color: #1464b5;
       transition: background-color 0.3s;
      }
      /* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  border-radius: 5px;
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
      form {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 50px;
      }

      input[type="url"] {
        width: 60%;
        padding: 10px;
        font-size: 1.2em;
        margin-right: 10px;
        border-radius: 5px;
        border: none;
      }

      input[type="submit"] {
        width: 20%;
        padding: 10px;
        font-size: 1.2em;
        background-color: #6E6E6E;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      input[type="submit"]:hover{
       background-color: #1464b5;
       transition: background-color 0.3s;
      }
      
      /* add the loader styles */
      .loader {
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #1464b5;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite; /* Safari */
        animation: spin 2s linear infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -60px; /* half of the loader width */
        transform: translate(-50%, -50%);
      }

      .loader-hidden {
        display: none;
      }

      /* add keyframes for spinner animation */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

    </style>
  </head>
  <body>
  <div class="header">
  <button class="faq" onclick="showModal()">FAQ</button>

<div id="modal" class="modal">

  <!-- Modal content -->
  <div class="modal-content">
    <span class="close" onclick="hideModal()">&times;</span>
    Q: What are some example URL's? <br>
    A: https://www.tfrrs.org/lists/3970/BIG_EAST_Indoor_Performance_List &nbsp;&nbsp;&nbsp;&nbsp; https://tf.tfrrs.org/lists/3947/Big_12_Indoor_Performance_List <br> <br>
    Q: Which conferences are included in the scoring system? <br>
    A: This scoring system includes all major track conferences in the United States. <br> <br>
    Q: How does the website predict the conferences scores? <br>
    A: The website uses Puppeteer to webscrape the website TFRRS and predicts team scores based on past results. <br> <br>
    Q: How does the scoring system work? <br>
    A: The scoring system awards points to each team based on their placement in each given event. The team that finishes in first place is awarded 10 points, the team in second place receives 8 points, third place receives 6 points, fourth place receives 4 points, fifth place receives 2 points, and sixth place receives 1 point. 
  </div>

</div>
  <h1>Input the URL of the track conference you wish to score below</h1>

</div>
    <form action="/scrape" method="POST">
    <input type="url" name="url" id="url" placeholder="https://www.tfrrs.org/lists/3952/Big_Ten_Indoor_Performance_List">
    <input type="submit" value="Submit" onclick="showLoader()">
    </form>
      <div class="loader loader-hidden" id="loader"></div>
      <script>
  function showLoader() {
    document.getElementById("loader").classList.remove("loader-hidden");
  }
  function showModal() {
    document.getElementById("modal").style.display = "block";
  }
  function hideModal(){
    document.getElementById("modal").style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
</script>
  </body>
</html>
    `);
});

app.post("/scrape", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(req.body.url);

  const scoreTeams = async () => {
    let teamNameandScores = [];
    let teams = [];
    let teamScores = []; //update this array with the teamList so indexes match
    // scoring : 10, 8, 6 , 4, 2, 1
    let addtoscore = 10;

    var gender = "m";

    for (let j = 0; j <= 81; j++) {
      if (
        (await page.$(
          `#list_data > div.panel-body.frame-loading-hide > div.row.gender_${gender}.standard_event_hnd_${j}`
        )) !== null
      ) {
        var rows = await page.$$(
          `#list_data > div.panel-body.frame-loading-hide > div.row.gender_m.standard_event_hnd_${j} tbody tr`,
          (element) => element.textContent
        );
        if (rows.length >= 6) {
          var numrows = 6;
        } else {
          var numrows = rows.length;
        }

        for (let i = 0; i < numrows; i++) {
          const row = rows[i];
          const headerName = await page.$eval(
            `#list_data > div.panel-body.frame-loading-hide > div.row.gender_m.standard_event_hnd_${j} > div > div.custom-table-title`,
            (element) => element.textContent
          );
          if (headerName.includes("Relay")) {
            // this will be used to determine if we are looking at a relay
            var teamName = await row.$eval(
              "td:nth-of-type(2)",
              (element) => element.textContent
            );
          } else {
            var teamName = await row.$eval(
              "td:nth-of-type(4)",
              (element) => element.textContent
            );
          }
          if (teams.includes(teamName) == false) {
            teams.push(teamName); // pushes to end of array so I find the index by subtracting from length
            if (addtoscore != 2) {
              teamScores[teamScores.length] = addtoscore;
              addtoscore -= 2;
            } else if (addtoscore == 2) {
              teamScores[teamScores.length] = addtoscore;
              addtoscore--;
            }
          } else {
            if (teams.includes(teamName) == true) {
              // find index of team => "" and add to it's score index
              if (addtoscore != 2) {
                teamScores[teams.indexOf(teamName)] += addtoscore;
                addtoscore -= 2;
              } else if (addtoscore == 2) {
                teamScores[teams.indexOf(teamName)] += addtoscore;
                addtoscore--;
              }
            }
          }
        }
        addtoscore = 10;
      }
    }
    // format teamNameandScores array so that it is a list of objects
    for (let i = 0; i < teams.length; i++) {
      teamNameandScores.push({ name: teams[i], score: teamScores[i] });
    }
    // sort by score (highest to lowest)
    teamNameandScores.sort((a, b) => b.score - a.score);
    return teamNameandScores;
  };

  const result = await scoreTeams();
  //res.send(result);

  // let output = "";
  // for (let i = 0; i < result.length; i++) {
  //   output += `${result[i].name}: ${result[i].score} `;
  // }
  // res.send(`<pre>${output}</pre>`);
  // create table rows with team names and scores
  let rows = "";
  for (let i = 0; i < result.length; i++) {
    rows += `
        <tr>
          <td>${result[i].name}</td>
          <td>${result[i].score}</td>
        </tr>
      `;
  }

  // format the output with HTML and CSS
  const output = `
  <html>
  <head>
    <title>Team Score Predictor</title>
    <style>
      body {
        background-color: #191919;
        margin: 0;
        padding: 0;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100px;
        padding: 0 20px;
      }
      
      h1 {
        color: #F0F0F0;
        font-size: 50px;
        margin: 0;
        flex-grow: 1;
        text-align: center;
        margin-right: 8%;
      }
      
      .faq {
        color: #F0F0F0;
        margin: 0;
        margin-left: 20px;
        width: 5%;
        padding: 10px;
        font-size: 1.2em;
        background-color: #6E6E6E;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .faq:hover{
        background-color: #1464b5;
       transition: background-color 0.3s;
      }
      /* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  border-radius: 5px;
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
      form {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 50px;
      }

      input[type="url"] {
        width: 60%;
        padding: 10px;
        font-size: 1.2em;
        margin-right: 10px;
        border-radius: 5px;
        border: none;
      }

      input[type="submit"] {
        width: 20%;
        padding: 10px;
        font-size: 1.2em;
        background-color: #6E6E6E;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      input[type="submit"]:hover{
       background-color: #1464b5;
       transition: background-color 0.3s;
      }
      
      /* add the loader styles */
      .loader {
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #1464b5;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite; /* Safari */
        animation: spin 2s linear infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -60px; /* half of the loader width */
        transform: translate(-50%, -50%);
      }

      .loader-hidden {
        display: none;
      }

      /* add keyframes for spinner animation */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

    </style>
  </head>
  <body>
  <div class="header">
  <button class="faq" onclick="showModal()">FAQ</button>

<div id="modal" class="modal">

  <!-- Modal content -->
  <div class="modal-content">
    <span class="close" onclick="hideModal()">&times;</span>
    Q: What are some example URL's? <br>
    A: https://www.tfrrs.org/lists/3970/BIG_EAST_Indoor_Performance_List &nbsp;&nbsp;&nbsp;&nbsp; https://tf.tfrrs.org/lists/3947/Big_12_Indoor_Performance_List <br> <br>
    Q: Which conferences are included in the scoring system? <br>
    A: This scoring system includes all major track conferences in the United States. <br> <br>
    Q: How does the website predict the conferences scores? <br>
    A: The website uses Puppeteer to webscrape the website TFRRS and predicts team scores based on past results. <br> <br>
    Q: How does the scoring system work? <br>
    A: The scoring system awards points to each team based on their placement in each given event. The team that finishes in first place is awarded 10 points, the team in second place receives 8 points, third place receives 6 points, fourth place receives 4 points, fifth place receives 2 points, and sixth place receives 1 point. 
  </div>

</div>
  <h1>Input the URL of the track conference you wish to score below</h1>

</div>
    <form action="/scrape" method="POST">
    <input type="url" name="url" id="url" placeholder="https://www.tfrrs.org/lists/3952/Big_Ten_Indoor_Performance_List">
    <input type="submit" value="Submit" onclick="showLoader()">
    </form>
      <div class="loader loader-hidden" id="loader"></div>
      <script>
  function showLoader() {
    document.getElementById("loader").classList.remove("loader-hidden");
  }
  function showModal() {
    document.getElementById("modal").style.display = "block";
  }
  function hideModal(){
    document.getElementById("modal").style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
</script>
  </body>
</html>
      <html>
        <head>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1rem;
              color: #e6eaf2;
              font-size: 0.9rem;
              font-weight: 400;
              line-height: 1.6;
              background-color: transparent;
            }
  
            th, td {
              padding: 0.5rem;
              vertical-align: top;
              border-top: 1px solid #1464b5;
              font-size: 25px;
            }
  
            th {
              font-weight: 700;
              background-color: transparent;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th style="font-size: 30px;">Team</th>
                <th style="font-size: 30px;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  res.send(output);
  await browser.close();
});

// Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
