package main

import (
    "net/http"
	"github.com/gin-gonic/gin"
	"io"
	"time"
	"github.com/gin-contrib/cors"
	"encoding/json"
)

var data []map[string]interface{}
var lastUpdate time.Time

func getCalendar(c *gin.Context) {

	conditionTime := (time.Now()).Add(10 * time.Minute)

	if len(data) == 0 || lastUpdate.After(conditionTime) {

		url := "https://edt-v2.univ-nantes.fr/events?start=2000-03-16&end=2999-03-22&timetables%5B0%5D=106112"

		client := http.Client{
			Timeout: 10 * time.Second,
		}

		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		res, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer res.Body.Close()

		if res.Body == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "empty response body"})
			return
		}

		body, err := io.ReadAll(res.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := json.Unmarshal(body, &data); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		lastUpdate = time.Now()
	}

	
	c.JSON(http.StatusOK, data)
}

func main() {
    router := gin.Default()
	router.Use(cors.Default())

    router.GET("/calendar", getCalendar)

	print("Server running at localhost:3000 \n")
    router.Run("localhost:3000")
}