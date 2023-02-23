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
            <body>
                <form action="/scrape" method="POST">
                    <input type="url" name="url" id="url" />
                    <input type="submit" value="Submit" />
                </form>
            </body>
        </html>
    `);
});

app.post("/scrape", async (req, res) => {
  const browser = await puppeteer.launch();
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
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1rem;
              color: #212529;
              font-size: 0.9rem;
              font-weight: 400;
              line-height: 1.6;
              background-color: transparent;
            }
  
            th, td {
              padding: 0.75rem;
              vertical-align: top;
              border-top: 1px solid #dee2e6;
            }
  
            th {
              font-weight: 700;
              background-color: #f8f9fa;
            }
          </style>
        </head>
        <body>
          <h1>Team Scores</h1>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Score</th>
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
