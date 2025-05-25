import { useState, useCallback } from "react";
import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import FileDropzone from "../components/FileDropzone";
import "../App.css";
import testReplace from "../utils/replace";

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const handleFilesUploaded = (files) => {
    console.log('Files uploaded:', files);}

  return (
    <main className="container">
      <h1>Welcome to Smart Object Cloner</h1>

      <div className="row">
        <FileDropzone onFilesUploaded={handleFilesUploaded} className="row"/>
      </div>
      <button onClick={() => testReplace()}>Test Replace</button>
    </main>
  );
}

export default Home;
