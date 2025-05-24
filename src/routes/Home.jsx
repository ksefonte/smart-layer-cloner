import { useState, useCallback } from "react";
import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import FileDropzone from "../components/FileDropzone";
import "../App.css";

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");


  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }
  const handleFilesUploaded = (files) => {
    console.log('Files uploaded:', files);}

  return (
    <main className="container">
      <h1>Welcome to Smart Object Cloner</h1>

      <div className="row">
        <FileDropzone onFilesUploaded={handleFilesUploaded} />
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default Home;
