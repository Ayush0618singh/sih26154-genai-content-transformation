"use client";


interface GlobalErrorProps {
  error: Error & {
    digest?:
      string;
  };

  reset:
    () => void;
}


export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin:
            0,

          minHeight:
            "100vh",

          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",

          background:
            "#11100e",

          color:
            "#f7f4ec",
        }}
      >
        <main
          style={{
            minHeight:
              "100vh",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding:
              "24px",

            background:
              "radial-gradient(circle at 50% 0%, rgba(196, 151, 70, 0.16), transparent 38%), #11100e",
          }}
        >
          <div
            style={{
              width:
                "100%",

              maxWidth:
                "540px",

              padding:
                "36px",

              border:
                "1px solid rgba(212, 174, 96, 0.22)",

              borderRadius:
                "24px",

              background:
                "rgba(28, 26, 22, 0.95)",

              boxShadow:
                "0 35px 100px -50px rgba(0,0,0,0.9)",

              textAlign:
                "center",
            }}
          >
            <div
              style={{
                width:
                  "64px",

                height:
                  "64px",

                margin:
                  "0 auto",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                border:
                  "1px solid rgba(212, 174, 96, 0.28)",

                borderRadius:
                  "18px",

                background:
                  "rgba(212, 174, 96, 0.1)",

                color:
                  "#d8b56d",

                fontSize:
                  "28px",
              }}
            >
              !
            </div>


            <p
              style={{
                margin:
                  "22px 0 0",

                color:
                  "#d8b56d",

                fontSize:
                  "10px",

                fontWeight:
                  800,

                letterSpacing:
                  "0.16em",

                textTransform:
                  "uppercase",
              }}
            >
              TransformAI · System Error
            </p>


            <h1
              style={{
                margin:
                  "12px 0 0",

                fontSize:
                  "28px",

                lineHeight:
                  1.2,

                letterSpacing:
                  "-0.04em",
              }}
            >
              The application encountered an unexpected problem.
            </h1>


            <p
              style={{
                margin:
                  "14px auto 0",

                maxWidth:
                  "420px",

                color:
                  "#aaa397",

                fontSize:
                  "14px",

                lineHeight:
                  1.7,
              }}
            >
              Your data has not been intentionally modified. Retry
              the application to restore the workspace.
            </p>


            {process.env.NODE_ENV ===
              "development" && (
              <div
                style={{
                  marginTop:
                    "22px",

                  padding:
                    "14px",

                  overflow:
                    "auto",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  borderRadius:
                    "12px",

                  background:
                    "rgba(255,255,255,0.035)",

                  textAlign:
                    "left",
                }}
              >
                <pre
                  style={{
                    margin:
                      0,

                    color:
                      "#aaa397",

                    fontSize:
                      "11px",

                    lineHeight:
                      1.6,

                    whiteSpace:
                      "pre-wrap",

                    wordBreak:
                      "break-word",
                  }}
                >
                  {
                    error.message
                  }

                  {error.digest
                    ? `\nDigest: ${error.digest}`
                    : ""}
                </pre>
              </div>
            )}


            <button
              type="button"
              onClick={
                reset
              }
              style={{
                marginTop:
                  "26px",

                minHeight:
                  "44px",

                border:
                  "1px solid rgba(212, 174, 96, 0.35)",

                borderRadius:
                  "12px",

                padding:
                  "0 22px",

                cursor:
                  "pointer",

                background:
                  "linear-gradient(135deg, #d6b266, #b88a38)",

                color:
                  "#17130c",

                fontSize:
                  "14px",

                fontWeight:
                  700,

                boxShadow:
                  "0 16px 40px -22px rgba(212,174,96,0.7)",
              }}
            >
              Retry TransformAI
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}