import fs from "fs";
import http from "http";

export default function startServer(promptsAndImages) {
  // Prepare the HTML content
  let htmlContent = `<html>
    <head>
      <title>Prompts and Images</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Helvetica, sans-serif;
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
        <tr><th>Prompt</th><th>Image 1</th><th>Image 2</th><th>Image 3</th><th>Image 4</th><th>Image 5</th></tr>`;

  // Add a table row for each prompt and image link
  for (let i = 1; i <= Object.keys(promptsAndImages).length; i++) {
    htmlContent += `<tr><td>${promptsAndImages[i].prompt}</td>`;
    for (let j = 0; j < promptsAndImages[i].images.length; j++) {
      htmlContent += `<td>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img src="${promptsAndImages[i].images[j]}" alt="Image ${
        j + 1
      }" onerror="handleImageError(this)">
        <p style="word-wrap: break-word; margin-top: 5px;">${
          promptsAndImages[i].images[j]
        }</p>
        <button onclick="copyToClipboard('${
          promptsAndImages[i].images[j]
        }')">Copy URL</button>
      </div>
      </td>`;
    }
    htmlContent += `</tr>`;
  }

  htmlContent += `</table>
    <script>
      function copyToClipboard(url) {
        navigator.clipboard.writeText(url)
          .then(() => {
            console.log('URL copied to clipboard:', url);
            // alert('URL copied to clipboard!');
          })
          .catch((error) => {
            console.error('Failed to copy URL:', error);
            alert('Failed to copy URL.');
          });
      }

      function handleImageError(image) {
        image.onerror = null;
        image.src = 'image-not-found.png'; // Path to the image-not-found image
        image.alt = 'Image not found';
      }
    </script>
    </body>
    </html>`;

  // Write the HTML content to a file
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
