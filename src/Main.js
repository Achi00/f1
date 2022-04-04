import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import App from './App';
import Gallery from "./gallery/gallery"
import Home from "./Home/Home"
import "./index.css"

function Main() {
  return (
    <>
      <BrowserRouter class="links">
      <Link className='link' to="/">Home</Link>
      <Link className='link0' to="/about">About</Link>
      <Link className='link1' to="/gallery">Gallery</Link>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/about" element={<App />}/>
          <Route path="/gallery" element={<Gallery />}/>
        </Routes>
      </BrowserRouter>
      </>
  )
}

export default Main