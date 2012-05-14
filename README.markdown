---
title: Simon
date: 30 March, 2012
description: A visualisation commissioned by the Edinburgh Festivals Innovation Lab and supported by the INTERREG IVB North-West Europe Programme.  It was designed by Stefanie Posavec and built using the new Summer Festivals Listings API.
thumbnail: thumbnail.png
---

<!--
TODO

General
    Add resize to container for both tree and game in index.html

Game
    fix vertical positioning

Tree
    Add node near parent
    Resize node, edge based on number of nodes and screen dimensions
    Zoom, drag - hammer.js?
-->

<style>
  body {
    /* prevent cut/copy/paste dialog and highlight on webkit */
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
</style>

<script src="lib/jquery/jquery-1.7.1.min.js" type="text/javascript"></script>
<script src="lib/springy/springy.js" type="text/javascript"></script>
<script src="treeui.js" type="text/javascript"></script>

<script src="lib/d3/d3.js" type="text/javascript"></script>
<script src="lib/d3/d3.csv.js" type="text/javascript"></script>

<script src="lib/touch/touch.js"></script>

<script type="text/javascript" src="constants.js"></script>

<img src="$thumbnail$" align="left" alt="Simon Game" width="128" height="128" />

TODO: description
Based on [writeup][lecwriteup]

You can also try the fullscreen versions of the [game](game.html) and [tree](tree.html), or get into the [source code][src].

[lecwriteup]: http://www.lel.ed.ac.uk/lec/the-%E2%80%9Calien-language%E2%80%9D-experiment/
[src]: https://github.com/justinq/simon

<div id="container" ontouchmove="BlockMove(event);">
  <!--
    The audio sources for the buttons
  -->
  <audio id="blue-tone" preload autobuffer>
    <source src="audio/blue.oga" type="audio/ogg">
    <source src="audio/blue.wav" type="audio/wav">
<!--  <source src="audio/blue.m4a" type="audio/mp4"> -->
  </audio>
  <audio id="yellow-tone" preload autobuffer>
    <source src="audio/yellow.oga" type="audio/ogg">
    <source src="audio/yellow.wav" type="audio/wav">
<!--  <source src="audio/yellow.m4a" type="audio/mp4"> -->
  </audio>
    <audio id="green-tone" preload autobuffer>
    <source src="audio/green.oga" type="audio/ogg">
    <source src="audio/green.wav" type="audio/wav">
<!--  <source src="audio/green.m4a" type="audio/mp4"> -->
  </audio>
    <audio id="red-tone" preload autobuffer>
    <source src="audio/red.oga" type="audio/ogg">
    <source src="audio/red.wav" type="audio/wav">
<!--  <source src="audio/red.m4a" type="audio/mp4"> -->
  </audio>

  <!-- The game -->
  <div id="game_viz"></div>
  <script type="text/javascript" src="game.js"></script>
  <!-- The tree -->
  <canvas id="tree_viz" width="640" height="480">
    <p>Your browser doesn't support canvas.</p>
  </canvas>
  <script type="text/javascript" src="tree.js"></script>
</div>
