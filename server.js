import express from "express";
import cors from "cors";

let cachedTimetable = null;
let lastUpdate;

async function getTimetable() {
  try {
    if (!lastUpdate || (Date.now() - lastUpdate) > 600_000) { // 10s cache
      const response = await fetch(
        "https://edt-v2.univ-nantes.fr/events?start=2000-03-16&end=2999-03-22&timetables%5B0%5D=106112"
      );

      if (!response.ok) throw new Error("Failed to fetch timetable");

      const content = await response.json();

      lastUpdate = Date.now();
      cachedTimetable = content
      return true
    }
  } catch (err) {
    console.error("Error in getTimetable:", err);
  }

  return false
}

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/proxy-calendar", async (req, res) => {
  try {
    await getTimetable();

    const content = cachedTimetable;

    // if (!content || !content.startsWith("BEGIN:VCALENDAR")) {
    //   return res.status(500).json({ error: "Could not fetch calendar" });
    // }

    const data = content // icsToJson(content);

    console.log(data)

    res.set("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ error: "Error processing calendar" });
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));