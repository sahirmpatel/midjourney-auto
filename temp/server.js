import fs from "fs";
import http from "http";
import { prompts, imageLinks } from "./user.js";

// Prepare the HTML content
let htmlContent = `<html>
<head>
  <title>Prompts and Images</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      padding: 10px;
      border: 1px solid black;
      word-break: break-word;
    }
    img {
      max-height: 50vh;
      width: auto;
    }
  </style>
</head>
<body>
<h1>Prompts and Images</h1>
<table>
<tr><th>Prompt</th><th>Image Link</th></tr>`;

// Add a table row for each prompt and image link
for (let i = 0; i < prompts.length; i++) {
  htmlContent += `<tr>
    <td>${prompts[i]}</td>
    <td>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img src="${imageLinks[i]}" alt="Image ${i + 1}">
        <p style="word-wrap: break-word; margin-top: 5px;">${imageLinks[i]}</p>
      </div>
    </td>
  </tr>`;
}

htmlContent += `</table>
</body>
</html>`;

// Write the HTML content to a file

export default function startServer() {
  fs.writeFileSync("index.html", htmlContent);

  // Start the server
  const server = http.createServer((req, res) => {
    fs.readFile("index.html", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      return res.end();
    });
  });

  server.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
  });
}
