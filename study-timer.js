// ==UserScript==
// @name         Alura Video Study Timer + Reset
// @namespace    http://tampermonkey.net/
// @version      2025-07-09
// @description  Conta tempo de vídeo tocando na Alura e avisa ao completar 1h. Adiciona botão para resetar tempo.
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
    console.log("⏱️ Tempo reiniciado.");
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
      video.addEventListener('play', iniciarContador);
      video.addEventListener('pause', pausarContador);
      video.addEventListener('ended', pausarContador);

      if (!video.paused) {
        iniciarContador();
      }
    } else {
      if (tempoEmSegundos > 0 && !intervalo) {
        console.log("🎯 Sem vídeo na página, mas continuando o cronômetro.");
        iniciarContador();
      }
    }
  }

  function criarBotaoReset() {
    const botao = document.createElement('button');
    botao.textContent = '⏹️ Resetar Tempo';
    botao.style.position = 'fixed';
    botao.style.bottom = '20px';
    botao.style.right = '20px';
    botao.style.zIndex = '9999';
    botao.style.padding = '10px 16px';
    botao.style.backgroundColor = '#f44336';
    botao.style.color = 'white';
    botao.style.border = 'none';
    botao.style.borderRadius = '8px';
    botao.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    botao.style.cursor = 'pointer';
    botao.style.fontSize = '14px';

    botao.addEventListener('click', () => {
      const confirmar = confirm("Tem certeza que deseja resetar o tempo assistido?");
      if (confirmar) {
        resetarTempo();
      }
    });

    document.body.appendChild(botao);
  }

  const observer = new MutationObserver(() => {
    monitorarVideo();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  monitorarVideo();
  criarBotaoReset();
})();
