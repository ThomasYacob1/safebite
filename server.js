require("dotenv").config();
const express = require("express");

const cors= require("cors");
const fetch =require("node-fetch");

const { createClient } = require("@supabase/supabase-js");
const path = require("path");
 
const app= express();

const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
 

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
 
const FDA_BASE = "https://api.fda.gov/food/enforcement.json";
 
app.get("/api/recalls", async (req, res) => {
  try {
    const { search = "", classification = "", limit = 20, skip = 0 } = req.query;
 
    let searchParts = [];
    if (search) searchParts.push(`product_description:"${search}"`);
    
    if (classification) searchParts.push(`classification:"${classification}"`);
 
    const searchParam = searchParts.length
      ? `&search=${encodeURIComponent(searchParts.join("+AND+"))}`
      : "";
 
    const url = `${FDA_BASE}?limit=${limit}&skip=${skip}${searchParam}`;
    const response = await fetch(url);
 
    if (!response.ok) {
      return res.status(response.status).json({ error: "FDA API error", status: response.status });
    }
 
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("FDA fetch error:", err);
    res.status(500).json({ error: "Failed to fetch recall data" });
  }
});
 


app.get("/api/stats", async (req, res) => {
  try {
    const url= `${FDA_BASE}?count=classification.exact`;
    const response = await fetch(url);
 
    if (!response.ok) {
      return res.status(response.status).json({ error: "FDA API error" });
    }
 
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
 


app.get("/api/searches", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("recent_searches")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(10);
 
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Supabase read error:", err);
    res.status(500).json({ error: "Failed to fetch recent searches" });
  }
});
 


app.post("/api/searches", async (req, res) => {
  try {
    const { term } = req.body;
    if (!term || typeof term !== "string" || !term.trim()) {
      return res.status(400).json({ error: "Search term is required" });
    }
 
    const { data, error } = await supabase
      .from("recent_searches")
      .insert([{ term: term.trim(), searched_at: new Date().toISOString() }])
      .select();
 
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Supabase write error:", err);
    res.status(500).json({ error: "Failed to save search" });
  }
});
 

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "public", "about.html")));
app.get("/help", (req, res) => res.sendFile(path.join(__dirname, "public", "help.html")));
 

app.listen(PORT, () => {
  console.log(`SafeBite server running on http://localhost:${PORT}`);
});
 
module.exports = app; 