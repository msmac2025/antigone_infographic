const tooltipConfig = {
    plugins: {
        tooltip: {
            callbacks: {
                title: function(tooltipItems) {
                    const item = tooltipItems[0];
                    let label = item.chart.data.labels[item.dataIndex];
                    if (Array.isArray(label)) {
                        return label.join(' ');
                    }
                    return label;
                }
            }
        }
    }
};

const stage1ChartCtx = document.getElementById('stage1Chart').getContext('2d');
new Chart(stage1ChartCtx, {
    type: 'doughnut',
    data: {
        labels: ['Enduring Understandings', 'Essential Questions', 'Knowledge', 'Skills'],
        datasets: [{
            label: 'Stage 1 Components',
            data: [25, 25, 25, 25],
            backgroundColor: ['#0A2463', '#3E92CC', '#73A6D4', '#A8C5E0'],
            borderColor: '#FFFFFF',
            borderWidth: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            ...tooltipConfig.plugins,
            legend: {
                display: false
            }
        }
    }
});

const stage2ChartCtx = document.getElementById('stage2Chart').getContext('2d');
new Chart(stage2ChartCtx, {
    type: 'bar',
    data: {
        labels: [
            'Analytical Essay', 
            ['Socratic', 'Seminar/Debate'], 
            ['Character', 'Journals'],
            'Reading Quizzes', 
            'Exit Tickets'
        ],
        datasets: [{
            label: 'Assessment Impact',
            data: [100, 80, 60, 50, 40],
            backgroundColor: ['#0A2463', '#3E92CC', '#3E92CC', '#3E92CC', '#3E92CC'],
            borderColor: '#FFFFFF',
            borderWidth: 2,
            borderRadius: 4
        }]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
             ...tooltipConfig.plugins,
            legend: {
                display: false
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { display: false },
                 ticks: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: { 
                    color: '#1D1D1D',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    }
});

// Gemini API Integration
const apiKey = "AIzaSyDdS73YxNhCpJYcTqtJqHLUKHZOwU7orIU"; 

function markdownToHtml(markdownText) {
    let htmlText = markdownText;
    // Bold: **text** or __text__
    htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlText = htmlText.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    htmlText = htmlText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    htmlText = htmlText.replace(/_(.*?)_/g, '<em>$1</em>');
    // Line breaks
    htmlText = htmlText.replace(/\n/g, '<br>');
    return htmlText;
}

async function callGemini(prompt, outputElement, loaderElement, copyButton) {
    outputElement.innerHTML = '';
    outputElement.classList.add('hidden');
    if (copyButton) copyButton.classList.add('hidden');
    loaderElement.style.display = 'block';

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            outputElement.innerHTML = markdownToHtml(text);
            outputElement.classList.remove('hidden');
            if (copyButton) copyButton.classList.remove('hidden');
        } else {
            outputElement.innerHTML = `<p class="text-red-600">Error: No content generated. Please try again.</p>`;
            outputElement.classList.remove('hidden');
        }
    } catch (error) {
        outputElement.innerHTML = `<p class="text-red-600">Error: ${error.message}. Check console for details.</p>`;
        outputElement.classList.remove('hidden');
        console.error("Gemini API call failed:", error);
    } finally {
        loaderElement.style.display = 'none';
    }
}

// Copy to clipboard function
function copyToClipboard(elementId, copyButton) {
    const outputElement = document.getElementById(elementId);
    const textToCopy = outputElement.innerText;
    
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const originalText = copyButton.innerText;
    copyButton.innerText = 'Copied!';
    setTimeout(() => {
        copyButton.innerText = originalText;
    }, 1500);
}

// Stage 1: Explain Enduring Understandings
const explainEUBtn = document.getElementById('explainEUBtn');
const euOutput = document.getElementById('euOutput');
const euLoader = document.getElementById('euLoader');
const copyEUBtn = document.getElementById('copyEUBtn');

explainEUBtn.addEventListener('click', () => {
    const prompt = `Explain in 2-3 sentences what 'Enduring Understandings' mean in the context of teaching Sophocles' 'Antigone', providing an example specific to the play.`;
    callGemini(prompt, euOutput, euLoader, copyEUBtn);
});
copyEUBtn.addEventListener('click', () => copyToClipboard('euOutput', copyEUBtn));

// Stage 2: Suggest Formative Assessment Ideas
const suggestFormativeBtn = document.getElementById('suggestFormativeBtn');
const formativeOutput = document.getElementById('formativeOutput');
const formativeLoader = document.getElementById('formativeLoader');
const copyFormativeBtn = document.getElementById('copyFormativeBtn');

suggestFormativeBtn.addEventListener('click', () => {
    const prompt = `Suggest 3-4 creative and brief formative assessment ideas for a high school unit on Sophocles' 'Antigone', focusing on checking comprehension and analysis of themes like law vs. morality.`;
    callGemini(prompt, formativeOutput, formativeLoader, copyFormativeBtn);
});
copyFormativeBtn.addEventListener('click', () => copyToClipboard('formativeOutput', copyFormativeBtn));

// Stage 3: More Scaffolding Examples
const moreScaffoldingBtn = document.getElementById('moreScaffoldingBtn');
const scaffoldingOutput = document.getElementById('scaffoldingOutput');
const scaffoldingLoader = document.getElementById('scaffoldingLoader');
const copyScaffoldingBtn = document.getElementById('copyScaffoldingBtn');

moreScaffoldingBtn.addEventListener('click', () => {
    const prompt = `Provide 3-4 concrete examples of scaffolding strategies for high school students struggling with Sophocles' 'Antigone', specifically related to complex language or thematic understanding.`;
    callGemini(prompt, scaffoldingOutput, scaffoldingLoader, copyScaffoldingBtn);
});
copyScaffoldingBtn.addEventListener('click', () => copyToClipboard('scaffoldingOutput', copyScaffoldingBtn));

// Stage 3: More Enrichment Examples
const moreEnrichmentBtn = document.getElementById('moreEnrichmentBtn');
const enrichmentOutput = document.getElementById('enrichmentOutput');
const enrichmentLoader = document.getElementById('enrichmentLoader');
const copyEnrichmentBtn = document.getElementById('copyEnrichmentBtn');

moreEnrichmentBtn.addEventListener('click', () => {
    const prompt = `Provide 3-4 concrete examples of enrichment opportunities for advanced high school students studying Sophocles' 'Antigone', encouraging deeper analysis or creative extension.`;
    callGemini(prompt, enrichmentOutput, enrichmentLoader, copyEnrichmentBtn);
});
copyEnrichmentBtn.addEventListener('click', () => copyToClipboard('enrichmentOutput', copyEnrichmentBtn));

// Print Infographic
const printInfographicBtn = document.createElement('button');
printInfographicBtn.id = 'printInfographicBtn';
printInfographicBtn.className = 'fixed bottom-4 right-4 bg-[#0A2463] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#3E92CC] transition-colors text-lg font-bold z-50';
printInfographicBtn.innerText = '🖨️ Print Infographic';
document.body.appendChild(printInfographicBtn);

printInfographicBtn.addEventListener('click', () => {
    window.print();
});
