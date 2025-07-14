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
const apiKey = ""; 

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

async function callGemini(prompt, outputElement, loaderElement) {
    outputElement.innerHTML = '';
    outputElement.classList.add('hidden');
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
            // Convert Markdown to HTML before displaying
            outputElement.innerHTML = markdownToHtml(text);
            outputElement.classList.remove('hidden');
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

// Stage 1: Explain Enduring Understandings
const explainEUBtn = document.getElementById('explainEUBtn');
const euOutput = document.getElementById('euOutput');
const euLoader = document.getElementById('euLoader');

explainEUBtn.addEventListener('click', () => {
    const prompt = `Explain in 2-3 sentences what 'Enduring Understandings' mean in the context of teaching Sophocles' 'Antigone', providing an example specific to the play.`;
    callGemini(prompt, euOutput, euLoader);
});

// Stage 2: Suggest Formative Assessment Ideas
const suggestFormativeBtn = document.getElementById('suggestFormativeBtn');
const formativeOutput = document.getElementById('formativeOutput');
const formativeLoader = document.getElementById('formativeLoader');

suggestFormativeBtn.addEventListener('click', () => {
    const prompt = `Suggest 3-4 creative and brief formative assessment ideas for a high school unit on Sophocles' 'Antigone', focusing on checking comprehension and analysis of themes like law vs. morality.`;
    callGemini(prompt, formativeOutput, formativeLoader);
});

// Stage 3: More Scaffolding Examples
const moreScaffoldingBtn = document.getElementById('moreScaffoldingBtn');
const scaffoldingOutput = document.getElementById('scaffoldingOutput');
const scaffoldingLoader = document.getElementById('scaffoldingLoader');

moreScaffoldingBtn.addEventListener('click', () => {
    const prompt = `Provide 3-4 concrete examples of scaffolding strategies for high school students struggling with Sophocles' 'Antigone', specifically related to complex language or thematic understanding.`;
    callGemini(prompt, scaffoldingOutput, scaffoldingLoader);
});

// Stage 3: More Enrichment Examples
const moreEnrichmentBtn = document.getElementById('moreEnrichmentBtn');
const enrichmentOutput = document.getElementById('enrichmentOutput');
const enrichmentLoader = document.getElementById('enrichmentLoader');

moreEnrichmentBtn.addEventListener('click', () => {
    const prompt = `Provide 3-4 concrete examples of enrichment opportunities for advanced high school students studying Sophocles' 'Antigone', encouraging deeper analysis or creative extension.`;
    callGemini(prompt, enrichmentOutput, enrichmentLoader);
});
