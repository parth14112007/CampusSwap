/**
 * CampusSwap Full Electronics Expert AI Assistant API Endpoint
 * 
 * Server-side / Serverless function:
 * - Vercel Serverless Function compatible (api/electronics-assistant.js)
 * - Vite Connect Middleware compatible (invoked via vite.config.js during local development)
 * 
 * Security:
 * - Server-side only: Reads GEMINI_API_KEY or OPENAI_API_KEY directly from process.env.
 * - Never exposes API secrets to the client-side bundle.
 * - Does NOT use VITE_ prefix for secrets.
 */

const SYSTEM_PROMPT = `You are the CampusSwap Full Electronics Expert AI Assistant — an authoritative, senior electronics design engineer, laboratory instructor, and tutor for engineering college students.

Your primary mission is to assist students with ANY electronics question across:
1. Electronic Components (passives, diodes, transistors, power semiconductors, integrated circuits, microcontrollers, optoelectronics, RF, electromechanical).
2. Sensors & Transducers (working principles, pinouts, wiring, excitation voltage, signal levels, ADC interfacing, noise filtering, limitations).
3. Circuit Solutions & Practical Troubleshooting (systematic root-cause diagnosis, supply rail checks, biasing, thermal dissipation, ground loops, parasitics, flyback protection).
4. Circuit Design & Engineering Workflows (concepts, component selection criteria, mathematical formulas, step-by-step calculations with units, expected outputs, trade-offs like LDO vs Buck, safety and thermal limits).
5. Circuit Analysis & Theory (Ohm's Law, KCL, KVL, Thevenin/Norton theorems, mesh/nodal analysis, AC/DC analysis, impedance, frequency response, filters, resonance, power factor).
6. Component Selection & Comparison (application-driven pros and cons: e.g. MOSFET vs BJT, L298N vs BTS7960, LM358 vs LM324, 1N4007 vs 1N5819, relay vs solid-state).
7. Calculations & Working: Always show the mathematical formula first, substitute values with units (V, mA, uF, kΩ, etc.), and state the calculated result clearly with standard preferred component values (E12/E24 series where applicable).

STRICT DATASHEET & INTEGRITY RULES:
- NEVER invent or guess a component's pinout, absolute maximum ratings (Vds_max, Vce_max, I_continuous, thermal resistance Rth_jc), or package dimensions.
- If a component has multiple package variants (e.g. SOT-23 vs TO-220 vs SOIC-8) where pin numbering differs, explicitly state this and caution the student to verify their specific package code in the manufacturer datasheet.
- If a part number is unfamiliar or ambiguous, state what you know about the series and advise consulting the official manufacturer datasheet.

OUTPUT STYLE & FORMATTING:
- Use clear markdown headers, bullet points, and numbered lists for procedures.
- Format formulas in clean LaTeX/math or clear standard notation (e.g. R = (Vcc - Vf) / If).
- Provide ASCII circuit diagrams or clear pin-by-pin connection tables whenever describing wiring or IC hookups.
- For troubleshooting questions (e.g. "My LED is not turning on" or "My MOSFET is overheating"), provide a step-by-step diagnostic checklist ranked from most common to edge cases.`;

/**
 * Built-in offline knowledge solver for when no API key is yet configured.
 * Answers common student queries accurately and guides on setting up GEMINI_API_KEY.
 */
function generateOfflineEngineeringReply(query) {
  const q = (query || '').toLowerCase();

  if (q.includes('led') && (q.includes('not turning on') || q.includes('troubleshoot') || q.includes('off') || q.includes('fix'))) {
    return `### 🔍 Systematic Troubleshooting: LED Not Turning On

Here is the standard engineering diagnostic checklist to isolate the failure:

#### 1. Polarity Check (Most Common)
- **Anode (+):** Usually the longer lead, or the side with the smaller internal triangle flag.
- **Cathode (-):** Shorter lead, or the flat edge on the 5mm plastic rim.
- *Test:* Use a digital multimeter in **Diode Mode**. Touch red probe to anode, black probe to cathode. The LED should glow faintly and display forward voltage ($V_f \\approx 1.8\\text{V}-3.2\\text{V}$).

#### 2. Resistor & Current Path
- Verify the current-limiting resistor is in series.
- Calculate required resistor:
  $$R = \\frac{V_{CC} - V_f}{I_f}$$
  *Example:* For $V_{CC} = 5\\text{V}$, red LED ($V_f \\approx 2.0\\text{V}$), target current $15\\text{mA}$:
  $$R = \\frac{5\\text{V} - 2.0\\text{V}}{0.015\\text{A}} = 200\\Omega \\quad (\\text{Use standard } 220\\Omega)$$
- If resistor is $> 10\\text{k}\\Omega$, current will be $< 0.3\\text{mA}$, making it appear off.

#### 3. Breadboard / Wiring Continuity
- Breadboard power rails often have a split in the middle. Ensure jumper wires bridge the gap.
- Measure voltage directly across the LED pins with your DMM set to DC Volts.

#### 4. Component Damage
- If the LED was momentarily connected directly to $5\\text{V}$ or $12\\text{V}$ without a resistor, the internal bond wire has melted due to thermal overcurrent. Replace the LED.`;
  }

  if (q.includes('mosfet') && (q.includes('heat') || q.includes('hot') || q.includes('overheat') || q.includes('warm'))) {
    return `### 🔥 Root Cause Analysis: MOSFET Overheating in Switching Circuits

When a MOSFET heats up, it is either suffering from excessive **conduction losses** or **switching losses**:

#### 1. Insufficient Gate-to-Source Voltage ($V_{GS}$)
- **Standard MOSFETs (e.g. IRF540N):** Require $V_{GS} = 10\\text{V}$ to fully turn on. If driven directly from a $3.3\\text{V}$ (ESP32/STM32) or $5\\text{V}$ (Arduino) GPIO, the MOSFET operates in the **linear/ohmic region**, causing $R_{DS(on)}$ to spike from $0.04\\Omega$ to several ohms!
- **Fix:** Use a **logic-level MOSFET** (e.g. IRLZ44N, FQP30N06L, AO3400) specified for $R_{DS(on)}$ at $V_{GS} = 3.3\\text{V}$ or $5\\text{V}$, or add a gate driver IC (TC4427, MCP1407, or a transistor totem-pole).

#### 2. Switching Losses from Slow Gate Transitions
- MOSFET gates have parasitic capacitance ($C_{iss} = C_{gs} + C_{gd}$).
- If driven with a high gate resistor (e.g. $> 1\\text{k}\\Omega$) at high PWM frequencies ($> 20\\text{kHz}$), charging/discharging $C_{iss}$ takes microseconds, forcing the device through high $V_{DS} \\times I_D$ states.
- **Fix:** Keep gate series resistor between $10\\Omega$ and $100\\Omega$. Ensure PWM frequency matches the gate drive capability.

#### 3. Inductive Flyback Overvoltage
- If switching an inductive load (motor, relay, solenoid), the collapsing magnetic field creates high-voltage spikes ($V = -L \\frac{di}{dt}$) that exceed $V_{DSS}$ and trigger avalanche breakdown.
- **Fix:** Connect a fast flyback diode (e.g. 1N5819 Schottky or UF4007) antiparallel across the motor terminals.

#### 4. Conduction Loss Calculation
- Power dissipated:
  $$P_{cond} = I_D^2 \\times R_{DS(on)} \\times \\text{Duty Cycle}$$
- *Example:* At $10\\text{A}$ and $R_{DS(on)} = 0.05\\Omega$, $P = 100 \\times 0.05 = 5\\text{W}$. A TO-220 package without a heatsink has $R_{\\theta JA} \\approx 62^\\circ\\text{C/W}$, which causes junction temperature to reach $25^\\circ\\text{C} + (5\\text{W} \\times 62) = 335^\\circ\\text{C}$ (destruction). A heatsink is mandatory!`;
  }

  if (q.includes('555') && (q.includes('frequency') || q.includes('astable') || q.includes('pwm') || q.includes('duty'))) {
    return `### ⏱️ NE555 Astable Multivibrator Design & Calculations

In an astable 555 circuit, the output oscillates continuously between HIGH and LOW:

#### 1. Wiring Configuration
- **Pin 1:** GND
- **Pin 2 (TRIG) & Pin 6 (THRESH):** Tied together, connected to top of timing capacitor $C$
- **Pin 3 (OUT):** Output square wave
- **Pin 4 (RESET):** Tied to $V_{CC}$ (prevents spurious resets)
- **Pin 5 (CTRL):** $10\\text{nF}$ ($0.01\\mu\\text{F}$) ceramic cap to GND for noise immunity
- **Pin 7 (DISCH):** Between $R_1$ and $R_2$
- **Pin 8 (VCC):** $4.5\\text{V} - 15\\text{V}$

#### 2. Governing Equations
- Charge Time ($T_{high}$):
  $$T_{high} = 0.693 \\times (R_1 + R_2) \\times C$$
- Discharge Time ($T_{low}$):
  $$T_{low} = 0.693 \\times R_2 \\times C$$
- Total Period ($T$) and Frequency ($f$):
  $$T = T_{high} + T_{low} = 0.693 \\times (R_1 + 2R_2) \\times C$$
  $$f = \\frac{1}{T} = \\frac{1.44}{(R_1 + 2R_2) \\times C}$$
- Duty Cycle ($D$):
  $$D = \\frac{T_{high}}{T} = \\frac{R_1 + R_2}{R_1 + 2R_2} \\times 100\\%$$

#### 3. Standard Design Example ($1\\text{kHz}$, $\\sim 60\\%$ Duty Cycle)
- Choose $C = 100\\text{nF} = 0.1\\mu\\text{F}$.
- Formula: $(R_1 + 2R_2) = \\frac{1.44}{1000 \\times 100 \\times 10^{-9}} = 14.4\\text{k}\\Omega$.
- Choose standard values: $R_1 = 4.7\\text{k}\\Omega$, $R_2 = 4.7\\text{k}\\Omega$.
  - $R_1 + 2R_2 = 14.1\\text{k}\\Omega$
  - Calculated $f = \\frac{1.44}{14.1\\text{k}\\Omega \\times 0.1\\mu\\text{F}} \\approx 1021\\text{Hz} \\approx 1.02\\text{kHz}$.
  - Duty Cycle: $D = \\frac{4.7 + 4.7}{4.7 + 9.4} = 66.7\\%$.
  *(Tip: To get $< 50\\%$ duty cycle, place a 1N4148 diode across $R_2$ anode to pin 7, cathode to pin 6).*`;
  }

  if (q.includes('buck') || (q.includes('5v') && (q.includes('power supply') || q.includes('regulator') || q.includes('12v')))) {
    return `### ⚡ 12V to 5V Step-Down Converter: Linear (LM7805/LM317) vs Buck Converter

#### 1. Comparison & Thermal Reality Check
| Metric | Linear Regulator (LM7805) | Buck Switching Converter (LM2596) |
| :--- | :--- | :--- |
| **Efficiency** | $\\eta = \\frac{V_{out}}{V_{in}} = \\frac{5}{12} \\approx 41.6\\%$ | $\\eta \\approx 88\\% - 94\\%$ |
| **Power Wasted as Heat** | $P_{loss} = (V_{in} - V_{out}) \\times I_{out}$ | $P_{loss} = P_{in} \\times (1 - \\eta)$ |
| **At $1\\text{A}$ Output** | $P_{loss} = (12 - 5) \\times 1 = 7\\text{W}$ (Needs heavy heatsink) | $P_{loss} \\approx 0.5\\text{W}$ (Runs cool) |
| **Complexity** | 3 pins, 2 capacitors | Inductor, diode, capacitors, IC |
| **Output Ripple** | Extremely low ($< 5\\text{mV}$) | $\\approx 30\\text{mV} - 50\\text{mV}$ switching noise |

#### 2. Design Recommendation
- For $I_{out} < 100\\text{mA}$ or low-noise audio/ADC applications: Use **LM7805** or **LM317** with $0.33\\mu\\text{F}$ input and $0.1\\mu\\text{F}$ output ceramic bypass capacitors.
- For $I_{out} \\ge 500\\text{mA}$ (robotics, Raspberry Pi, motors, relays): Use a **Buck Converter** (e.g. LM2596, MP2307, or TPS54302).
- Key Buck Components:
  - Inductor: $33\\mu\\text{H} - 47\\mu\\text{H}$ rated for $> 2\\text{A}$ saturation current.
  - Catch Diode: Schottky diode (e.g. 1N5822 / SS34) for fast reverse recovery and low $V_f$.
  - Low-ESR electrolytic capacitors at input ($100\\mu\\text{F}/25\\text{V}$) and output ($220\\mu\\text{F}/10\\text{V}$).`;
  }

  if (q.includes('lm358') || q.includes('lm324') || q.includes('op-amp') || q.includes('op amp')) {
    return `### 🔬 Operational Amplifiers: LM358 vs LM324 & Basic Configurations

#### 1. Quick Comparison
- **LM358:** Dual operational amplifier (8-pin DIP / SOIC-8).
- **LM324:** Quad operational amplifier (14-pin DIP / SOIC-14) containing 4 identical LM358-grade op-amps.
- **Key Specs for Both:**
  - Supply: Single supply ($3\\text{V}-32\\text{V}$) or Dual supply ($\\pm 1.5\\text{V}-\\pm 16\\text{V}$).
  - Input Common-Mode Range: Includes Ground (GND), perfect for single-supply $5\\text{V}$ systems.
  - Output Swing: Down to near GND ($0\\text{V}-20\\text{mV}$), but maximum positive swing is limited to $V_{CC} - 1.5\\text{V}$ (e.g. only $3.5\\text{V}$ on a $5\\text{V}$ rail). It is **not** rail-to-rail.

#### 2. Essential Configurations
- **Non-Inverting Amplifier:**
  $$V_{out} = V_{in} \\times \\left(1 + \\frac{R_f}{R_{in}}\\right)$$
  High input impedance, no phase inversion.
- **Inverting Amplifier:**
  $$V_{out} = -V_{in} \\times \\left(\\frac{R_f}{R_{in}}\\right)$$
  Requires dual supply or virtual ground offset ($V_{CC}/2$).
- **Voltage Follower / Buffer:**
  Output tied directly to inverting input ($-$). Gain $= 1$, infinite input impedance, protects weak sensors from loading down.`;
  }

  // General fallback response
  return `### ⚡ CampusSwap Electronics Engineering Advisory

Regarding your question on **"${query.slice(0, 80)}"**:

#### General Electronics Engineering Principles:
1. **Voltage & Current Compatibility:** Ensure all signal logic levels match ($3.3\\text{V}$ vs $5\\text{V}$ requires level shifting like 74LVC245 or BSS138 bidirectional shifters).
2. **Current-Carrying Capacity:** Size PCB traces and wiring to handle expected peak currents ($1\\text{mm}$ trace width per $1\\text{A}$ for $1\\text{oz}$ copper in standard ambient).
3. **Decoupling & Grounding:** Always place a $0.1\\mu\\text{F}$ ($100\\text{nF}$) ceramic capacitor as close as possible to the $V_{CC}$ and $GND$ pins of digital and analog ICs to suppress high-frequency noise.
4. **Inductive Protection:** Always clamp inductive loads (relays, DC motors, solenoids) with a reverse-biased flyback diode (1N4007 or 1N5819 Schottky) to prevent back-EMF destruction.

*(Tip: Set your \`GEMINI_API_KEY\` in your server \`.env\` file to enable unlimited interactive deep-reasoning across any custom IC, circuit calculation, or project BOM!)*`;
}

/**
 * Call Google Gemini API
 */
async function callGeminiApi(apiKey, messages, image) {
  // Map conversation messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  // Append image part to the last user message if provided
  if (image && contents.length > 0) {
    const lastMsg = contents[contents.length - 1];
    if (lastMsg.role === 'user') {
      const match = image.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
      if (match) {
        lastMsg.parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
  }

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  // Try gemini-2.5-flash first, fallback to gemini-1.5-flash
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini (${model}) API error [${res.status}]: ${errorText}`);
      }

      const data = await res.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (replyText) {
        return {
          reply: replyText,
          model: model,
          provider: 'Google Gemini'
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API');
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAiApi(apiKey, messages, image) {
  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m, idx) => {
      if (idx === messages.length - 1 && image) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: image } }
          ]
        };
      }
      return { role: m.role, content: m.content };
    })
  ];

  const payload = {
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.3,
    max_tokens: 2048
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error [${res.status}]: ${errorText}`);
  }

  const data = await res.json();
  const replyText = data.choices?.[0]?.message?.content;
  if (!replyText) {
    throw new Error('No content returned from OpenAI API');
  }

  return {
    reply: replyText,
    model: 'gpt-4o-mini',
    provider: 'OpenAI'
  };
}

/**
 * Main Request Handler for Serverless / Node.js
 */
export default async function handler(req, res) {
  // Handle CORS if needed
  if (req.method === 'OPTIONS') {
    res.writeHead?.(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end?.();
    return;
  }

  // GET: Health / Configuration Check
  if (req.method === 'GET') {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const isConfigured = Boolean(geminiKey || openaiKey);

    const statusPayload = {
      status: 'online',
      service: 'CampusSwap Electronics Expert AI',
      configured: isConfigured,
      activeProvider: geminiKey ? 'Google Gemini' : (openaiKey ? 'OpenAI' : 'Offline Knowledge Engine'),
      requiredEnvVar: 'GEMINI_API_KEY',
      timestamp: new Date().toISOString()
    };

    if (res.status) {
      res.status(200).json(statusPayload);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statusPayload));
    }
    return;
  }

  if (req.method !== 'POST') {
    if (res.status) {
      res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    }
    return;
  }

  // Parse Body if not already parsed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { messages = [], image = null } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    const errResp = { error: 'Request body must include a non-empty "messages" array.' };
    if (res.status) {
      res.status(400).json(errResp);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(errResp));
    }
    return;
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Case 1: Live Gemini API
  if (geminiKey) {
    try {
      const result = await callGeminiApi(geminiKey, messages, image);
      const responseData = {
        success: true,
        configured: true,
        reply: result.reply,
        model: result.model,
        provider: result.provider
      };
      if (res.status) {
        res.status(200).json(responseData);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      }
      return;
    } catch (err) {
      console.error('Error with Gemini API, falling back...', err);
      // If error occurs, proceed to check openaiKey or fallback
    }
  }

  // Case 2: Live OpenAI API
  if (openaiKey) {
    try {
      const result = await callOpenAiApi(openaiKey, messages, image);
      const responseData = {
        success: true,
        configured: true,
        reply: result.reply,
        model: result.model,
        provider: result.provider
      };
      if (res.status) {
        res.status(200).json(responseData);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      }
      return;
    } catch (err) {
      console.error('Error with OpenAI API, falling back...', err);
    }
  }

  // Case 3: Key is not configured — provide friendly setup notice + offline solver
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const offlineReply = generateOfflineEngineeringReply(lastUserMsg);

  const responseData = {
    success: true,
    configured: false,
    requiredEnvVar: 'GEMINI_API_KEY',
    notice: 'No AI API key is configured on the server yet. To enable full generative AI reasoning, add GEMINI_API_KEY=your_key to your server .env file or deployment settings (do NOT use VITE_ prefix).',
    reply: offlineReply,
    provider: 'Offline Electronics Engine',
    model: 'built-in-solver'
  };

  if (res.status) {
    res.status(200).json(responseData);
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
  }
}
