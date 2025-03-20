'use strict';

document.getElementById("comprobarBtn").addEventListener("click", verificarClima);

async function verificarClima() {
    let ubicacion = document.getElementById("ubicacion").value.trim();
    let apiKey = "5db085b19a9ce3c36d50986e38adb94c";
    let url;

    if (ubicacion) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${ubicacion}&appid=${apiKey}&units=metric&lang=es`;
    } else {
        if (!navigator.geolocation) {
            alert("Geolocalización no soportada.");
            return;
        }
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
            await obtenerDatos(url);
        });
        return;
    }
    await obtenerDatos(url);
}

async function obtenerDatos(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== "200") {
            alert("Ubicación no encontrada. Intenta otra ciudad.");
            return;
        }

        mostrarPronostico(data.list);
        cambiarFondo(data.list[0].weather[0].main, esDeDia(data.list[0].dt));

        if (data.city && data.city.country) {
            document.getElementById("ubicacionActual").textContent = `${data.city.name}, ${data.city.country}`;
        }

    } catch (error) {
        alert("Error al obtener datos. Revisa tu conexión.");
    }
}

function mostrarPronostico(lista) {
    const tabla = document.querySelector("#tablaClima tbody");
    tabla.innerHTML = "";

    lista.slice(0, 8).forEach(hora => {
        let icono = `https://openweathermap.org/img/wn/${hora.weather[0].icon}.png`;
        let fila = `
            <tr>
                <td>${new Date(hora.dt * 1000).toLocaleTimeString()}</td>
                <td><img src="${icono}" alt="${hora.weather[0].description}"> ${hora.weather[0].description}</td>
                <td>${hora.main.temp}°C</td>
                <td>${hora.main.feels_like}°C</td>
                <td>${hora.main.humidity}%</td>
                <td>${hora.wind.speed} m/s</td>
            </tr>`;
        tabla.innerHTML += fila;
    });
}

function cambiarFondo(clima, esDeDia) {
    let fondo = clima === "Rain" ? (esDeDia ? "assets/diaLluvioso.gif" : "assets/nocheLluviosa.gif") :
                clima === "Clear" ? (esDeDia ? "assets/diaSoleado.gif" : "assets/nocheEstrellada.gif") :
                "assets/default.gif";

    document.body.style.backgroundImage = `url('${fondo}')`;
}

function esDeDia(timestamp) {
    const hora = new Date(timestamp * 1000).getHours();
    return hora >= 6 && hora < 18;
}


