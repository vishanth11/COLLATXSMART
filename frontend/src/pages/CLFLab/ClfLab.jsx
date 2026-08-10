import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, Code, Play, RefreshCw, Terminal, Globe, Cpu, Database, TrendingUp } from 'lucide-react';

export default function ClfLab() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('js');

  // Hoisting Demo State
  const [hoistResult, setHoistResult] = useState('');
  
  // Callback Demo State
  const [callbackResult, setCallbackResult] = useState('');
  
  // Async Demo State
  const [asyncResult, setAsyncResult] = useState('');
  const [asyncLoading, setAsyncLoading] = useState(false);
  
  // DOM Demo State
  const [domInput, setDomInput] = useState('Dynamic Text');
  const [domColor, setDomColor] = useState('#FF5A1F');
  
  // JSON Demo State
  const [jsonInput, setJsonInput] = useState({ name: 'Arun Kumar', loanType: 'Bike Loan', amount: 80000 });
  const [jsonResult, setJsonResult] = useState('');
  
  // AJAX Demo State
  const [ajaxResult, setAjaxResult] = useState('');
  
  // jQuery Demo State
  const [jqLoaded, setJqLoaded] = useState(false);
  
  // Node HTTP Demo State
  const [nodeHttpResult, setNodeHttpResult] = useState('');

  // Load jQuery dynamically for CLF lab jQuery requirement demonstration
  useEffect(() => {
    if (activeTab === 'jquery' && !window.$) {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
      script.async = true;
      script.onload = () => {
        setJqLoaded(true);
        console.log('jQuery loaded in laboratory context.');
      };
      document.body.appendChild(script);
    } else if (window.$) {
      setJqLoaded(true);
    }
  }, [activeTab]);

  // HOISTING DEMO RUNNER
  const runHoistingDemo = () => {
    let result = '';
    
    // Demonstrate var hoisting
    result += `1. var test: Before definition var is hoisted and initialized to undefined.\n`;
    try {
      // We simulate hoisting behavior using a text template or eval (safe here since static code)
      result += `   Code: console.log(hoistedVar); var hoistedVar = "Successfully Hoisted";\n`;
      result += `   Result: hoistedVar = undefined\n\n`;
    } catch(e) {
      result += `   Error: ${e.message}\n\n`;
    }

    // Demonstrate let TDZ
    result += `2. let test: let is hoisted but NOT initialized (Temporal Dead Zone).\n`;
    result += `   Code: console.log(hoistedLet); let hoistedLet = "TDZ Error";\n`;
    result += `   Result: ReferenceError: Cannot access 'hoistedLet' before initialization\n\n`;
    
    // Demonstrate function hoisting
    result += `3. Function Declaration vs Expression:\n`;
    result += `   Code: declaredFunction(); function declaredFunction() { return "Declared functions are fully hoisted!"; }\n`;
    result += `   Result: "Declared functions are fully hoisted!"\n`;

    setHoistResult(result);
  };

  // CALLBACK DEMO RUNNER
  const runCallbackDemo = () => {
    setCallbackResult('Running callback chain...');
    
    // Callback logic
    function calculatePayment(amount, rate, callback) {
      const interest = amount * (rate / 100);
      const total = amount + interest;
      return callback(total);
    }

    setTimeout(() => {
      const finalResult = calculatePayment(80000, 5, (totalValue) => {
        return `Callback triggered. Total calculated principal + interest: ₹${totalValue}`;
      });
      setCallbackResult(finalResult);
    }, 8000); // simulate async delay
  };

  // ASYNC AWAIT RUNNER
  const runAsyncDemo = async () => {
    setAsyncLoading(true);
    setAsyncResult('Awaiting Promise resolution...');
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      await delay(2000);
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setAsyncResult(`Resolved via Async/Await!\nServer health report: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setAsyncResult(`Promise rejected: ${err.message}. Make sure Express server is running.`);
    } finally {
      setAsyncLoading(false);
    }
  };

  // JSON PARSER/STRINGIFIER RUNNER
  const runJsonDemo = (mode) => {
    if (mode === 'stringify') {
      const str = JSON.stringify(jsonInput, null, 2);
      setJsonResult(`JSON.stringify(object):\n${str}`);
    } else {
      try {
        const parsed = JSON.parse(jsonResult.replace('JSON.stringify(object):\n', ''));
        setJsonResult(`JSON.parse(string) successfully reconstructed Object:\nName: ${parsed.name}\nLoan: ${parsed.loanType}\nAmount: ₹${parsed.amount}`);
      } catch (err) {
        setJsonResult(`Error parsing: Paste a valid JSON string first.`);
      }
    }
  };

  // AJAX FETCH DEMO
  const runAjaxDemo = () => {
    setAjaxResult('Sending Fetch Request...');
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        setAjaxResult(`AJAX Success! Parsed payload:\n${JSON.stringify(data, null, 2)}`);
      })
      .catch(err => {
        setAjaxResult(`AJAX Fetch failed: ${err.message}. Make sure Express server is running on port 5000.`);
      });
  };

  // JQUERY FADE EFFECT RUNNER
  const runJQueryDemo = () => {
    if (window.$) {
      window.$('#jquery-demo-box')
        .fadeOut(600)
        .fadeIn(600)
        .css('border-color', '#FF5A1F');
    }
  };

  // NATIVE NODE HTTP SERVER GETTER
  const runNodeHttpDemo = async () => {
    setNodeHttpResult('Querying Native Node HTTP Server (Port 5001)...');
    try {
      const res = await fetch('http://localhost:5001/api/health');
      const data = await res.json();
      setNodeHttpResult(JSON.stringify(data, null, 2));
    } catch(err) {
      setNodeHttpResult(`Failed to reach Native Node Server on port 5001.\nError: ${err.message}\n(Ensure the backend is running and the secondary port is active.)`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">CLF Concepts Lab</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Interactive demonstration environment for Client-side / Full-stack academic syllabus concepts</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#27272A] pb-4 mb-8">
        <button 
          onClick={() => setActiveTab('js')}
          className={`px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'js' ? 'border-b-2 border-[#FF5A1F] text-white' : 'text-[#A0A0AB] hover:text-white'
          }`}
        >
          JS & DOM Basics
        </button>
        <button 
          onClick={() => setActiveTab('async')}
          className={`px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'async' ? 'border-b-2 border-[#FF5A1F] text-white' : 'text-[#A0A0AB] hover:text-white'
          }`}
        >
          Asynchronous JS
        </button>
        <button 
          onClick={() => setActiveTab('jquery')}
          className={`px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'jquery' ? 'border-b-2 border-[#FF5A1F] text-white' : 'text-[#A0A0AB] hover:text-white'
          }`}
        >
          jQuery & JSON
        </button>
        <button 
          onClick={() => setActiveTab('node')}
          className={`px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'node' ? 'border-b-2 border-[#FF5A1F] text-white' : 'text-[#A0A0AB] hover:text-white'
          }`}
        >
          Node.js Engine
        </button>
      </div>

      {/* TAB CONTENT: JS & DOM BASICS */}
      {activeTab === 'js' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* HOISTING DEMO */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Cpu size={20} className="text-[#FF5A1F]" /> Hoisting Demo
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Demonstrates variable allocation differences. JavaScript hoists variables declared with <code>var</code>, initializing them to undefined. Variables declared with <code>let</code>/<code>const</code> are placed in a Temporal Dead Zone until execution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Source Code</span>
                <pre className="lab-code-block">
{`// 1. var hoisting
console.log(x); // returns undefined
var x = 10;

// 2. let TDZ
console.log(y); // Throws ReferenceError
let y = 20;`}
                </pre>
                <button onClick={runHoistingDemo} className="btn btn-primary py-2.5 text-sm">
                  <Play size={14} /> Run Compiler Simulation
                </button>
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Console Output</span>
                <pre className="lab-code-block text-xs h-[160px] text-green-400 font-mono">
                  {hoistResult || 'Click Run to view hoisting diagnostics.'}
                </pre>
              </div>
            </div>
          </div>

          {/* DOM MANIPULATION DEMO */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Terminal size={20} className="text-[#FF5A1F]" /> DOM Manipulation
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Direct page alterations utilizing browser APIs. Updates innerHTML, textContent, styles, and dimensions dynamically on state changes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Text Content Input</label>
                  <input 
                    type="text" className="form-input text-sm" 
                    value={domInput} onChange={(e) => setDomInput(e.target.value)} 
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Border Accent Color</label>
                  <input 
                    type="color" className="form-input h-10 p-1" 
                    value={domColor} onChange={(e) => setDomColor(e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Interactive Live Render</span>
                <div 
                  className="lab-demo-area h-[135px] flex items-center justify-center text-center font-bold text-lg transition-all"
                  style={{ borderColor: domColor, color: domColor }}
                >
                  {domInput || 'Box Empty'}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: ASYNCHRONOUS JS */}
      {activeTab === 'async' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* CALLBACKS DEMO */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Cpu size={20} className="text-[#FF5A1F]" /> Callbacks
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Passing a function as an argument to another function to execute when a process completes. Used frequently in early Node.js file operations and async timelines.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Code Snippet</span>
                <pre className="lab-code-block">
{`function calculate(amount, rate, callback) {
  const interest = amount * (rate / 100);
  return callback(amount + interest);
}

// execute
calculate(80000, 5, (total) => {
  console.log("Calculated:", total);
});`}
                </pre>
                <button onClick={runCallbackDemo} className="btn btn-primary py-2.5 text-sm">
                  <Play size={14} /> Execute Callback Loop
                </button>
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Callback Log Output</span>
                <pre className="lab-code-block text-xs h-[160px] text-yellow-400 font-mono flex items-center justify-center">
                  {callbackResult || 'Waiting for trigger execution...'}
                </pre>
              </div>
            </div>
          </div>

          {/* ASYNC/AWAIT DEMO */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Globe size={20} className="text-[#FF5A1F]" /> Async / Await & Promises
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Modern asynchronous code structure built on Promises. Prevents "Callback Hell" and structures asynchronous threads cleanly using standard try/catch error traps.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Code Snippet</span>
                <pre className="lab-code-block">
{`async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error("API Rejected:", e);
  }
}`}
                </pre>
                <button onClick={runAsyncDemo} disabled={asyncLoading} className="btn btn-primary py-2.5 text-sm">
                  <Play size={14} /> Resolve Async/Await Promise
                </button>
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Promise Resolution Log</span>
                <pre className="lab-code-block text-xs h-[160px] text-blue-400 font-mono overflow-auto">
                  {asyncResult || 'Click Resolve to fetch backend status.'}
                </pre>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: JQUERY & JSON */}
      {activeTab === 'jquery' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* JQUERY SECTION */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Terminal size={20} className="text-[#FF5A1F]" /> jQuery Library Integration
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Isolated DOM handler showing jQuery queries. Demonstrates element matching and fade effects without polluting main React elements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Code Snippet</span>
                <pre className="lab-code-block">
{`$('#jquery-demo-box')
  .fadeOut(600)
  .fadeIn(600)
  .css('border-color', '#FF5A1F');`}
                </pre>
                <button 
                  onClick={runJQueryDemo} 
                  disabled={!jqLoaded}
                  className={`btn btn-primary py-2.5 text-sm ${!jqLoaded ? 'btn-disabled' : ''}`}
                >
                  <Play size={14} /> Execute JQuery Animation
                </button>
                {!jqLoaded && <p className="text-xs text-red-500 mt-2">Loading jQuery CDN script...</p>}
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">jQuery Target Container</span>
                <div 
                  id="jquery-demo-box"
                  className="lab-demo-area h-[135px] flex items-center justify-center text-center font-bold border-2 border-white rounded-xl bg-[#1D1D20]"
                >
                  jQuery Control Subject
                </div>
              </div>
            </div>
          </div>

          {/* JSON PARSING AND STRINGIFICATION */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Cpu size={20} className="text-[#FF5A1F]" /> JSON Serialization
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Converting application memory data structures to serialized string payloads for network routing (stringify) and parsing them back to active objects (parse).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Central Form State object</span>
                <pre className="lab-code-block text-[11px]">
                  {JSON.stringify(jsonInput, null, 2)}
                </pre>
                <div className="flex gap-3">
                  <button onClick={() => runJsonDemo('stringify')} className="btn btn-primary py-2 text-xs flex-1">
                    JSON.stringify()
                  </button>
                  <button onClick={() => runJsonDemo('parse')} className="btn btn-secondary py-2 text-xs border-[#27272A] flex-1">
                    JSON.parse()
                  </button>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Serialization Live Engine Output</span>
                <pre className="lab-code-block text-xs h-[200px] text-orange-400 font-mono overflow-auto">
                  {jsonResult || 'Choose Serialization Mode to verify compiler behavior.'}
                </pre>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: NODE.JS ENGINE */}
      {activeTab === 'node' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* NATIVE NODE HTTP SERVER */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Globe size={20} className="text-[#FF5A1F]" /> Native Node.js HTTP Server
            </h3>
            <p className="text-sm text-[#A0A0AB] mb-4">
              Demonstrates native routing without frameworks. Queries port <code>5001</code> where the native Node <code>http.createServer</code> module is running in parallel.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">Native Server Scaffolding (Coded in server.js)</span>
                <pre className="lab-code-block text-[10px]">
{`const nativeServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'Native HTTP' }));
  }
});
nativeServer.listen(5001);`}
                </pre>
                <button onClick={runNodeHttpDemo} className="btn btn-primary py-2.5 text-sm">
                  <Play size={14} /> Query Native Node Port (5001)
                </button>
              </div>
              <div>
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">HTTP Connection Response stream</span>
                <pre className="lab-code-block text-xs h-[180px] text-green-400 font-mono overflow-auto">
                  {nodeHttpResult || 'Click Query to fetch from the native HTTP server.'}
                </pre>
              </div>
            </div>
          </div>

          {/* BUFFERS, STREAMS, EVENTS IN COLLATXSMART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold text-[#FF5A1F] text-sm">
                <Cpu size={16} />
                <span>Node.js Buffers</span>
              </div>
              <p className="text-xs text-[#A0A0AB] leading-relaxed">
                Used to read file signatures in binary streams. Checks upload magic bytes in <code>documentController.js</code> to verify PDF/JPEG headers directly before disk writes.
              </p>
              <pre className="bg-[#050506] text-[#71717A] text-[9px] p-2.5 rounded-lg border border-[#27272A] font-mono leading-tight">
{`// Magic bytes verification
const firstBytes = buffer.slice(0, 4);
const isPDF = firstBytes.toString('hex') === '25504446';`}
              </pre>
            </div>

            <div className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold text-[#FF5A1F] text-sm">
                <Database size={16} />
                <span>Node.js Streams</span>
              </div>
              <p className="text-xs text-[#A0A0AB] leading-relaxed">
                Stream binary files directly without overloading RAM. Used in secure document downloads (<code>fs.createReadStream(path).pipe(res)</code>) and CSV report exports.
              </p>
              <pre className="bg-[#050506] text-[#71717A] text-[9px] p-2.5 rounded-lg border border-[#27272A] font-mono leading-tight">
{`// Direct read streaming
const stream = fs.createReadStream(filePath);
stream.on('error', (err) => next(err));
stream.pipe(res);`}
              </pre>
            </div>

            <div className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold text-[#FF5A1F] text-sm">
                <TrendingUp size={16} />
                <span>Node.js Events</span>
              </div>
              <p className="text-xs text-[#A0A0AB] leading-relaxed">
                Decoupled event-driven triggers using EventEmitter. When payments record successfully, <code>paymentEmitter.emit('paymentReceived')</code> calls audit log and schedule updates.
              </p>
              <pre className="bg-[#050506] text-[#71717A] text-[9px] p-2.5 rounded-lg border border-[#27272A] font-mono leading-tight">
{`// Event emitter trigger
paymentEmitter.emit('paymentReceived', {
  loanId, amount, customerId
});`}
              </pre>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
