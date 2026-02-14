<!DOCTYPE html>
<html>

<body>
  <script>
    window.messagePort = null

    const allowedOrigins = [
      'https://figma-gov.com',
      'https://www.figma.com',
      'https://staging.figma.com',
      'https://devenv01.figma.engineering',
      'https://local.figma.engineering:8443',
      'http://localhost:9000',
    ]

    const allowedOriginPatterns = [
      /^https:\/\/[a-z0-9-]+\.figdev\.systems:8443$/,
      /^https:\/\/[a-z0-9-]+\.figdev\.systems$/,
    ]

    function isAllowedOrigin(origin) {
      return allowedOrigins.includes(origin) || allowedOriginPatterns.some(p => p.test(origin))
    }

    window.addEventListener('message', (e) => {
      function sendMessage(data) {
        if (window.messagePort) {
          window.messagePort.postMessage({ data })
        }
      }

      if (isAllowedOrigin(e.origin)) {
        if (e.data.type === 'iframe-init') {
          window.messagePort = e.ports[0]
          window.__PREVIEW_IFRAME_INITIAL_OPTIONS__ = e.data.previewIframeInitialOptions

          sendMessage({
            method: 'status',
            state: 'init-received',
            isReady: false
          })

          if (e.data.initScriptBlob) {
            import(URL.createObjectURL(e.data.initScriptBlob))
          } else {
            const script = document.createElement('script')

            script.onload = async () => {
              function sendReady() {
                sendMessage({
                  method: 'status',
                  state: 'ready',
                  isReady: true
                })
              }

              if (window.__iframeScriptExecuted__) {
                sendReady()
                return
              }

              let executeInterval = null
              let timeout = null

              const timeoutPromise = new Promise((resolve) => {
                timeout = setTimeout(() => resolve('timeout'), 2000)
              })

              const scriptExecutedPromise = new Promise((resolve) => {
                executeInterval = setInterval(() => {
                  if (window.__iframeScriptExecuted__) {
                    resolve('ready')
                  }
                }, 50)
              })

              const result = await Promise.race([timeoutPromise, scriptExecutedPromise])

              clearTimeout(timeout)
              clearInterval(executeInterval)

              if (result === 'ready') {
                sendReady()
              } else {
                sendMessage({
                  method: 'status',
                  state: 'script-timeout',
                  isReady: false
                })
              }
            }

            script.onerror = (e) => {
              sendMessage({
                method: 'status',
                state: 'script-load-error',
                isReady: false,
                error: e.message
              })
            }

            script.src = e.data.initScriptURL
            // https://sentry.io/answers/script-error/
            script.crossOrigin = 'anonymous'
            document.body.appendChild(script)
          }
        }
      }
    })
  </script>
</body>

</html>
