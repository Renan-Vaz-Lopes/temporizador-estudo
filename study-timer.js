// ==UserScript==
// @name         Alura Video Study Timer
// @namespace    http://tampermonkey.net/
// @version      2025-07-07
// @description  Conta tempo de vídeo tocando na Alura e avisa ao completar 1h
// @author       Renan Vaz Lopes
// @match        https://cursos.alura.com.br/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'alura_tempo_assistido';
  let tempoEmSegundos = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
  const tempoTotal = 60 * 60; // 1 hora
  let intervalo = null;
  let videoEncontrado = false;

  function formatar(segundos) {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function salvarTempo() {
    localStorage.setItem(STORAGE_KEY, tempoEmSegundos);
  }

  function resetarTempo() {
    tempoEmSegundos = 0;
    localStorage.removeItem(STORAGE_KEY);
    console.log("⏱️ Tempo reiniciado após completar 1h.");
  }

  function iniciarContador() {
    if (intervalo) return;

    intervalo = setInterval(() => {
      tempoEmSegundos++;
      salvarTempo();
      console.log("Tempo assistido: " + formatar(tempoEmSegundos));

      if (tempoEmSegundos >= tempoTotal) {
        alert("✅ Você completou 1h líquida de estudo!");
        resetarTempo();
        clearInterval(intervalo);
        intervalo = null;
      }
    }, 1000);
  }

  function pausarContador() {
    clearInterval(intervalo);
    intervalo = null;
  }

  function monitorarVideo() {
    const video = document.querySelector('video') || document.querySelector('video-js video');

    if (video) {
      videoEncontrado = true;
      video.addEventListener('play', iniciarContador);
      video.addEventListener('pause', pausarContador);
      video.addEventListener('ended', pausarContador);

      if (!video.paused) {
        iniciarContador();
      }
    } else {
      // Se já estava contando antes, mas agora não tem vídeo, continua contando
      if (tempoEmSegundos > 0 && !intervalo) {
        console.log("🎯 Sem vídeo na página, mas continuando o cronômetro.");
        iniciarContador();
      }
    }
  }

  const observer = new MutationObserver(() => {
    monitorarVideo();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  monitorarVideo();
})();
