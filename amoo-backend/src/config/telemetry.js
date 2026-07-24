// OpenTelemetry instrumentation (OTel JS 2.x).
// Required BEFORE any other module in server.js so it can patch HTTP/Express.
//
// RESILIENCE: tracing is optional observability, not application logic. Every
// package is loaded defensively — if tracing cannot start (packages absent, a
// version mismatch, an exporter that won't initialise) we log one warning and
// the app serves traffic normally. This module must NEVER throw to its caller.
//
// API NOTE: OTel 2.x differs from 1.x. `Resource` is no longer a constructor
// (use `resourceFromAttributes()`), and `addSpanProcessor()` was removed —
// processors are passed to the provider constructor as `spanProcessors: [...]`.

const env = require("./env");

const SERVICE_NAME = "amoo-backend";
const SERVICE_VERSION = require("../../package.json").version || "1.0.0";

// Off in tests: the ConsoleSpanExporter dumps a span object per request (it
// buried the assertion output) and its timers kept the test process alive.
const DISABLED = env.nodeEnv === "test" || process.env.OTEL_SDK_DISABLED === "true";

let provider = null;

function start() {
  if (DISABLED) return null;

  const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
  const { resourceFromAttributes } = require("@opentelemetry/resources");
  const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = require("@opentelemetry/semantic-conventions");
  const {
    BatchSpanProcessor,
    SimpleSpanProcessor,
    ConsoleSpanExporter,
  } = require("@opentelemetry/sdk-trace-base");

  // Build the processor list up front — 2.x has no addSpanProcessor().
  const spanProcessors = [];

  // Console spans are a debugging aid, so opt-in rather than default-on for
  // every non-production run (which previously drowned the morgan log).
  if (!env.isProd && process.env.OTEL_CONSOLE_EXPORTER === "true") {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  if (env.otel.endpoint) {
    const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
    // Batch, not Simple: SimpleSpanProcessor issues one synchronous HTTP request
    // per span to the collector, in the request path.
    spanProcessors.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${env.otel.endpoint.replace(/\/$/, "")}/v1/traces` })
      )
    );
  }

  const tracerProvider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
    }),
    spanProcessors,
  });
  tracerProvider.register();

  // Auto-instrumentation is independently optional — a missing express
  // instrumentation package must not cost us HTTP tracing, or the process.
  const instrumentations = [];
  try {
    const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
    instrumentations.push(new HttpInstrumentation());
  } catch (_) { /* not installed — skip HTTP tracing */ }
  try {
    const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
    instrumentations.push(new ExpressInstrumentation());
  } catch (_) { /* not installed — skip Express tracing */ }

  if (instrumentations.length) {
    const { registerInstrumentations } = require("@opentelemetry/instrumentation");
    registerInstrumentations({ instrumentations });
  }

  return tracerProvider;
}

try {
  provider = start();
} catch (err) {
  // console.warn, not utils/logger: this runs before anything else and must
  // not pull in further modules that could themselves fail.
  console.warn(
    `[telemetry] disabled — tracing failed to initialise (${err.message}). ` +
      "The API is unaffected; install the @opentelemetry/* packages or set " +
      "OTEL_SDK_DISABLED=true to silence this."
  );
  provider = null;
}

// Flush pending spans on shutdown so the last requests before a deploy are not
// lost. Safe to call when tracing never started.
async function shutdownTelemetry() {
  if (!provider) return;
  try {
    await provider.shutdown();
  } catch (_) { /* nothing useful to do while exiting */ }
}

// Always an object, never the raw provider (which is null when disabled).
module.exports = {
  provider,
  shutdownTelemetry,
  enabled: provider !== null,
};
