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
      <body>
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

            fontFamily:
              "Arial, sans-serif",

            background:
              "#f8fafc",

            color:
              "#0f172a",
          }}
        >
          <div
            style={{
              width:
                "100%",

              maxWidth:
                "520px",

              padding:
                "32px",

              border:
                "1px solid #e2e8f0",

              borderRadius:
                "18px",

              background:
                "#ffffff",

              textAlign:
                "center",

              boxShadow:
                "0 20px 60px rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                fontSize:
                  "32px",
              }}
            >
              ⚠
            </div>

            <h1
              style={{
                marginTop:
                  "18px",

                marginBottom:
                  "10px",

                fontSize:
                  "24px",
              }}
            >
              Application error
            </h1>

            <p
              style={{
                margin:
                  "0",

                fontSize:
                  "14px",

                lineHeight:
                  "1.7",

                color:
                  "#64748b",
              }}
            >
              The application encountered an unexpected problem.
            </p>

            {process.env.NODE_ENV ===
              "development" && (
              <pre
                style={{
                  marginTop:
                    "20px",

                  padding:
                    "12px",

                  overflow:
                    "auto",

                  borderRadius:
                    "10px",

                  background:
                    "#f1f5f9",

                  textAlign:
                    "left",

                  fontSize:
                    "11px",

                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {
                  error.message
                }
              </pre>
            )}

            <button
              type="button"
              onClick={
                reset
              }
              style={{
                marginTop:
                  "24px",

                border:
                  "0",

                borderRadius:
                  "10px",

                padding:
                  "11px 18px",

                cursor:
                  "pointer",

                background:
                  "#0f172a",

                color:
                  "#ffffff",

                fontWeight:
                  "600",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}