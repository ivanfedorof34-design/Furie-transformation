const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fftBtn = document.getElementById("fftBtn");
const message = document.getElementById("message");

let signalData = [];
let signalChart = null;
let fftChart = null;

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = type;
}

function drawChart(canvasId, chartInstance, label, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    return new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map((_, index) => index),
            datasets: [
                {
                    label: label,
                    data: data,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Индекс"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Значение"
                    }
                }
            }
        }
    });
}

uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
        showMessage("Выберите CSV файл", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Ошибка загрузки файла");
        }

        signalData = result.signal;

        signalChart = drawChart(
            "signalChart",
            signalChart,
            "Исходный сигнал",
            signalData
        );

        fftBtn.disabled = false;
        showMessage("Файл успешно загружен");
    } catch (error) {
        showMessage(error.message, "error");
    }
});

fftBtn.addEventListener("click", async () => {
    if (!signalData.length) {
        showMessage("Сначала загрузите данные", "error");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/fft", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ signal: signalData })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Ошибка выполнения FFT");
        }

        fftChart = drawChart(
            "fftChart",
            fftChart,
            "FFT спектр",
            result.fft
        );

        showMessage("FFT успешно выполнено");
    } catch (error) {
        showMessage(error.message, "error");
    }
});
