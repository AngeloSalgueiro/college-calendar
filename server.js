// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { icsToJson } from 'ics-to-json';

const app = express();
app.use(cors()); // optional if fetching same origin

// Serve frontend folder "public"
app.use(express.static("public"));

// Proxy route
app.get("/proxy-calendar", async (req, res) => {
  try {
    const response = await fetch(
      "http://edt-v2.univ-nantes.fr/calendar/ics?timetables[0]=106112"
    );
    const text = await response.text();
    const data = icsToJson(text);
    res.set("Content-Type", "text/calendar");
    res.send(data);
  } catch (err) {
    res.status(500).send("Error fetching calendar");
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));