import { Activity, Boxes, Code2, Database, GitBranch, Layers3, Play, Radio, RotateCcw, Server, TerminalSquare, Trash2, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useLanguage } from "@/contexts/LanguageContext";

type LoanDocument = { id: number; customer: string; amount: number; status: "pending" | "approved" };

const httpExamples = {
  "/api/loans": { method: "GET", status: 200, response: '{ "loans": 12, "nextDue": "15 Aug 2026" }' },
  "/api/applications": { method: "POST", status: 201, response: '{ "applicationNumber": "CXS-2026-00042", "status": "submitted" }' },
  "/api/payments": { method: "PATCH", status: 200, response: '{ "paymentId": "PAY-108", "status": "recorded" }' },
};

const mongoSeed: LoanDocument[] = [
  { id: 1, customer: "Priya S.", amount: 240000, status: "pending" },
  { id: 2, customer: "Arun K.", amount: 480000, status: "approved" },
];

export default function ClfLab() {
  const { t } = useLanguage();
  const [padding, setPadding] = useState(24);
  const [border, setBorder] = useState(8);
  const [margin, setMargin] = useState(24);
  const [hoistingState, setHoistingState] = useState<"idle" | "var" | "let" | "function">("idle");
  const [httpRoute, setHttpRoute] = useState<keyof typeof httpExamples>("/api/loans");
  const [httpResponse, setHttpResponse] = useState(httpExamples["/api/loans"]);
  const [bufferInput, setBufferInput] = useState("Loan payment received");
  const [chunkSize, setChunkSize] = useState(8);
  const [bufferRun, setBufferRun] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [documents, setDocuments] = useState<LoanDocument[]>(mongoSeed);
  const [mongoCustomer, setMongoCustomer] = useState("");
  const [mongoAmount, setMongoAmount] = useState(120000);
  const [mongoAction, setMongoAction] = useState("collection");
  const dimensions = useMemo(() => ({ width: 240 + padding * 2 + border * 2 + margin * 2, height: 132 + padding * 2 + border * 2 + margin * 2 }), [padding, border, margin]);
  const bufferBytes = useMemo(() => new TextEncoder().encode(bufferInput), [bufferInput]);
  const bufferChunks = useMemo(() => Array.from({ length: Math.max(1, Math.ceil(bufferBytes.length / chunkSize)) }, (_, index) => bufferBytes.slice(index * chunkSize, index * chunkSize + chunkSize)), [bufferBytes, chunkSize]);
  const bufferBase64 = useMemo(() => btoa(String.fromCharCode(...Array.from(bufferBytes))), [bufferBytes]);
  const httpCode = `import { createServer } from "node:http";\n\nconst server = createServer((req, res) => {\n  if (req.url === "${httpRoute}") {\n    res.writeHead(${httpResponse.status}, { "content-type": "application/json" });\n    res.end(JSON.stringify(${httpResponse.response}));\n  }\n});\n\nserver.listen(3000);`;
  const mongoCode = `const loans = db.collection("loans");\n\n// ${mongoAction === "create" ? "Create" : mongoAction === "read" ? "Read" : mongoAction === "update" ? "Update" : mongoAction === "delete" ? "Delete" : "CRUD"}\n${mongoAction === "create" ? 'await loans.insertOne({ customer: "Priya S.", amount: 120000 });' : mongoAction === "read" ? 'await loans.find({ status: "approved" }).toArray();' : mongoAction === "update" ? 'await loans.updateOne({ id: 1 }, { $set: { status: "approved" } });' : mongoAction === "delete" ? 'await loans.deleteOne({ id: 1 });' : 'await loans.find({}).toArray();'}`;

  const runHttpRequest = () => setHttpResponse(httpExamples[httpRoute]);
  const runBufferPipeline = () => {
    setBufferRun(true);
    setEventLog(["stream:open", ...bufferChunks.map((_, index) => `data:chunk-${index + 1}`), "stream:end"]);
  };
  const emitEvent = (name: string) => setEventLog((current) => [...current, `event:${name}`]);
  const createDocument = () => {
    if (!mongoCustomer.trim()) return;
    setDocuments((current) => [...current, { id: Date.now(), customer: mongoCustomer.trim(), amount: mongoAmount, status: "pending" }]);
    setMongoCustomer("");
    setMongoAction("create");
  };
  const updateFirstDocument = () => {
    setDocuments((current) => current.map((document, index) => index === 0 ? { ...document, status: "approved" } : document));
    setMongoAction("update");
  };
  const deleteFirstDocument = () => {
    setDocuments((current) => current.slice(1));
    setMongoAction("delete");
  };

  return <div className="public-site"><PublicHeader /><main className="lab-page"><div className="site-container"><div className="lab-intro"><p className="eyebrow"><span className="eyebrow-line" />{t("lab.eyebrow")}</p><h1>{t("lab.heading")}</h1><p>{t("lab.body")}</p></div><div className="lab-grid">
    <section className="lab-card lab-card--box"><div className="lab-card__header"><div className="lab-card__icon"><Layers3 size={20} /></div><div><h2>{t("lab.boxTitle")}</h2><p>{t("lab.boxBody")}</p></div></div><div className="box-demo-stage"><div className="box-demo__margin" style={{ padding: `${margin}px` }}><div className="box-demo__border" style={{ padding: `${border}px` }}><div className="box-demo__padding" style={{ padding: `${padding}px` }}><div className="box-demo__content">{t("lab.content")}</div></div></div></div></div><div className="box-legend"><span><i className="legend-dot legend-dot--margin" />{t("lab.margin")}</span><span><i className="legend-dot legend-dot--border" />{t("lab.border")}</span><span><i className="legend-dot legend-dot--padding" />{t("lab.padding")}</span><span><i className="legend-dot legend-dot--content" />{t("lab.content")}</span></div><div className="lab-controls"><RangeControl label={t("lab.padding")} value={padding} onChange={setPadding} max={48} /><RangeControl label={t("lab.border")} value={border} onChange={setBorder} max={20} /><RangeControl label={t("lab.margin")} value={margin} onChange={setMargin} max={48} /></div><div className="box-output"><div><span>{t("lab.totalWidth")}</span><strong>{dimensions.width}px</strong></div><div><span>{t("lab.totalHeight")}</span><strong>{dimensions.height}px</strong></div></div></section>
    <section className="lab-card lab-card--hoist"><div className="lab-card__header"><div className="lab-card__icon lab-card__icon--orange"><Code2 size={20} /></div><div><h2>{t("lab.hoistingTitle")}</h2><p>{t("lab.hoistingBody")}</p></div></div><div className="code-window"><div className="code-window__bar"><span /><span /><span /><small>hoisting-demo.js</small></div><pre><code><span className="code-purple">const</span> loan = <span className="code-orange">"ready"</span>;

<span className="code-blue">showStatus</span>();

<span className="code-purple">function</span> <span className="code-blue">showStatus</span>() {'{'}
  <span className="code-purple">return</span> loan;
{'}'}</code></pre></div><div className="hoist-options"><button className={hoistingState === "var" ? "is-selected" : ""} onClick={() => setHoistingState("var")}><span>01</span><strong>var</strong><small>hoisted as undefined</small></button><button className={hoistingState === "let" ? "is-selected" : ""} onClick={() => setHoistingState("let")}><span>02</span><strong>let</strong><small>temporal dead zone</small></button><button className={hoistingState === "function" ? "is-selected" : ""} onClick={() => setHoistingState("function")}><span>03</span><strong>function</strong><small>available before line</small></button></div><div className={`hoist-output ${hoistingState !== "idle" ? "is-visible" : ""}`}><div className="hoist-output__top"><TerminalSquare size={17} /><span>Console output</span></div>{hoistingState === "idle" && <p>Choose an example to run it.</p>}{hoistingState === "var" && <p><b>var balance;</b><br />The declaration is hoisted. Before assignment, the value is <em>undefined</em>.</p>}{hoistingState === "let" && <p><b>let balance;</b><br />The name is hoisted but not initialised. Reading it early throws a <em>ReferenceError</em>.</p>}{hoistingState === "function" && <p><b>showStatus()</b><br />Function declarations are available before the line where they are written.</p>}</div><button className="button button--orange button--full" onClick={() => setHoistingState("idle")}><RotateCcw size={16} /> {t("lab.reset")}</button></section>
  </div>

  <section className="backend-lab"><div className="backend-lab__intro"><p className="eyebrow"><span className="eyebrow-line" />{t("lab.backendEyebrow")}</p><h2>{t("lab.backendHeading")}</h2><p>{t("lab.backendBody")}</p></div><div className="backend-lab__grid">
    <article className="backend-card backend-card--http"><div className="backend-card__heading"><div className="lab-card__icon"><Server size={20} /></div><div><span className="panel-kicker">01 / request → response</span><h3>{t("lab.httpTitle")}</h3><p>{t("lab.httpBody")}</p></div></div><div className="backend-card__body"><div className="backend-controls"><label><span>Route</span><select value={httpRoute} onChange={(event) => setHttpRoute(event.target.value as keyof typeof httpExamples)}>{Object.keys(httpExamples).map((route) => <option key={route} value={route}>{route}</option>)}</select></label><button className="button button--orange" onClick={runHttpRequest}><Play size={16} /> {t("lab.httpRun")}</button></div><div className="backend-request-grid"><div><span className="backend-label">{t("lab.httpRequest")}</span><code>{httpExamples[httpRoute].method} {httpRoute}</code><small>HTTP/1.1 · application/json</small></div><div><span className="backend-label">{t("lab.httpResponse")}</span><code className="backend-response">{httpResponse.status} OK</code><small>{httpResponse.response}</small></div></div><pre className="backend-code"><code>{httpCode}</code></pre></div></article>
    <article className="backend-card backend-card--runtime"><div className="backend-card__heading"><div className="lab-card__icon lab-card__icon--orange"><Activity size={20} /></div><div><span className="panel-kicker">02 / bytes → events</span><h3>{t("lab.bufferTitle")}</h3><p>{t("lab.bufferBody")}</p></div></div><div className="backend-card__body"><label className="backend-textarea"><span>{t("lab.bufferInput")}</span><textarea value={bufferInput} onChange={(event) => { setBufferInput(event.target.value); setBufferRun(false); }} rows={2} /></label><div className="backend-controls"><label><span>Chunk size <b>{chunkSize} bytes</b></span><input type="range" min="4" max="16" value={chunkSize} onChange={(event) => setChunkSize(Number(event.target.value))} /></label><button className="button button--dark" onClick={runBufferPipeline}><Zap size={16} /> {t("lab.bufferRun")}</button></div><div className="buffer-metrics"><div><strong>{bufferBytes.length}</strong><small>bytes</small></div><div><strong>{bufferChunks.length}</strong><small>{t("lab.bufferChunks")}</small></div><div><strong>{bufferBase64.slice(0, 12)}…</strong><small>base64 preview</small></div></div>{bufferRun && <div className="stream-trace"><div className="stream-trace__top"><Radio size={16} /> <span>{t("lab.eventLog")}</span></div><div className="stream-chunks">{bufferChunks.map((chunk, index) => <span key={index}>chunk {index + 1}<b>{chunk.length}b</b></span>)}</div><div className="event-log">{eventLog.map((event, index) => <code key={`${event}-${index}`}>{event}</code>)}</div></div>}<div className="event-actions"><button onClick={() => emitEvent("loan:received")}><GitBranch size={14} /> emit loan:received</button><button onClick={() => emitEvent("payment:recorded")}><Radio size={14} /> emit payment:recorded</button></div></div></article>
    <article className="backend-card backend-card--mongo"><div className="backend-card__heading"><div className="lab-card__icon"><Database size={20} /></div><div><span className="panel-kicker">03 / collection → documents</span><h3>{t("lab.mongoTitle")}</h3><p>{t("lab.mongoBody")}</p></div></div><div className="backend-card__body"><div className="mongo-create"><label><span>Customer</span><input value={mongoCustomer} placeholder="e.g. Meena R." onChange={(event) => setMongoCustomer(event.target.value)} /></label><label><span>Amount</span><input type="number" min={10000} value={mongoAmount} onChange={(event) => setMongoAmount(Number(event.target.value))} /></label><button className="button button--orange" onClick={createDocument}><Boxes size={16} /> {t("lab.mongoCreate")}</button></div><div className="mongo-actions"><button className={mongoAction === "read" ? "is-active" : ""} onClick={() => setMongoAction("read")}>find()</button><button className={mongoAction === "update" ? "is-active" : ""} onClick={updateFirstDocument}>updateOne()</button><button className={mongoAction === "delete" ? "is-active" : ""} onClick={deleteFirstDocument}><Trash2 size={13} /> deleteOne()</button></div><div className="mongo-layout"><div className="mongo-documents">{documents.length === 0 && <p className="mongo-empty">{t("lab.mongoEmpty")}</p>}{documents.map((document) => <div className="mongo-document" key={document.id}><div><strong>{document.customer}</strong><small>_id: {document.id} · ₹{document.amount.toLocaleString("en-IN")}</small></div><span className={`status-pill status-pill--${document.status}`}>{document.status}</span></div>)}</div><pre className="backend-code backend-code--mongo"><code>{mongoCode}</code></pre></div><p className="backend-note">{t("lab.mongoNote")}</p></div></article>
  </div></section>
  </div></main><PublicFooter /></div>;
}

function RangeControl({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max: number }) {
  return <label className="range-control"><span>{label}<b>{value}px</b></span><input type="range" min="0" max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
