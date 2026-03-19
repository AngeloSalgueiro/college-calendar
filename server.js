import express from "express";
import cors from "cors";
import { icsToJson } from 'ics-to-json';
import fs from "fs/promises";

let lastUpdate;

async function getTimetable() {
  let content = "";

  try {
    if (!lastUpdate || (Date.now() - lastUpdate) > 10000) { // 10s cache
      const response = await fetch(
        "http://edt-v2.univ-nantes.fr/calendar/ics?timetables[0]=106112"
      );

      if (!response.ok) throw new Error("Failed to fetch timetable");

      content = await response.text();
      await fs.writeFile("timetable.ics", content);
      lastUpdate = Date.now();
    } else {
      content = await fs.readFile("timetable.ics", "utf8");
    }
  } catch (err) {
    console.error("Error in getTimetable:", err);
    content = "";
  }

  return content;
}

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/proxy-calendar", async (req, res) => {
  try {
    const content = await getTimetable();

    if (!content || !content.startsWith("BEGIN:VCALENDAR")) {
      return res.status(500).json({ error: "Could not fetch calendar" });
    }

    const data = icsToJson(content);

    res.set("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ error: "Error processing calendar" });
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));