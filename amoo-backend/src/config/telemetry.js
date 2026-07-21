// Basic OpenTelemetry instrumentation.
// Must be required BEFORE any other module so it can patch HTTP/Express.

const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { Resource } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");

const env = require("./env");

const serviceName = "amoo-backend";

const provider = new NodeTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),
});

// Always log spans to console in non-production for local debugging.
if (!env.isProd) {
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

// In production, also export to an OTLP-compatible collector if configured.
const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
if (env.isProd && otelEndpoint) {
  provider.addSpanProcessor(
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: `${otelEndpoint}/v1/traces`,
      })
    )
  );
}

provider.register();

// Auto-instrument HTTP and Express (if the packages are installed).
try {
  require("@opentelemetry/instrumentation-http").HttpInstrumentation;
  const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
  const { registerInstrumentations } = require("@opentelemetry/instrumentation");
  registerInstrumentations({
    instrumentations: [new HttpInstrumentation()],
  });
} catch (_) {
  // HTTP instrumentation not installed — skip silently.
}

try {
  const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
  const { registerInstrumentations } = require("@opentelemetry/instrumentation");
  registerInstrumentations({
    instrumentations: [new ExpressInstrumentation()],
  });
} catch (_) {
  // Express instrumentation not installed — skip silently.
}

module.exports = provider;
