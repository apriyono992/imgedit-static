import { defineConfig, loadEnv, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/**
 * Tailwind v4 generates two incompatible CSS patterns for older browsers:
 *
 * 1. Range media query: @media (width >= 768px) → needs Chrome 113+
 *    Fix: → @media (min-width: 768px)
 *
 * 2. CSS Nesting nested @media inside class rules → needs Chrome 130+
 *    Fix: unnest to flat @media { .class { } }
 *
 * IMPORTANT: In Vite dev mode, Tailwind embeds CSS inside a JS module string.
 * Newlines inside that string are encoded as the ESCAPE SEQUENCE \n (two chars:
 * backslash + n), NOT as real newline characters (0x0A). Therefore \s* in our
 * regex does NOT match them — we must use (?:\s|\\n)* instead.
 */
function mediaQueryCompat(): Plugin {
  // Fix 1: range syntax → min-width
  const RE_RANGE = /@media\s*\(\s*width\s*>=\s*([\d.]+(?:px|rem|em))\s*\)/g
  const patchRange = (s: string) => s.replace(RE_RANGE, '@media (min-width: $1)')

  // Whitespace OR the 2-char escape sequence \n (as it appears inside JS strings)
  // (?:\s|\\n)* matches: real whitespace chars OR literal backslash+n OR literal backslash+r+backslash+n
  const WS = '(?:\\s|\\\\n|\\\\r\\\\n)*'

  // Fix 2: CSS Nesting → flat
  // Matches: .selector { @media (cond) { props } } even inside JS string literals
  const RE_NEST = new RegExp(
    `(\\.(?:[^\\s{\\\\]|\\\\[^\\s])+)${WS}\\{${WS}(@media${WS}\\([^)]+\\)${WS}\\{[^}]+\\})${WS}\\}`,
    'g'
  )

  const unnest = (s: string) =>
    s.replace(RE_NEST, (_, selector: string, mediaBlock: string) => {
      const condRE = /@media(?:\s|\\n|\\r\\n)*(\([^)]+\))(?:\s|\\n|\\r\\n)*\{([^}]+)\}/
      const m = condRE.exec(mediaBlock)
      if (!m) return _
      return `@media ${m[1]} { ${selector} {${m[2]}} }`
    })

  const patch = (s: string) => unnest(patchRange(s))

  return {
    name: 'media-query-compat',
    enforce: 'post',

    transform(code) {
      // Detection must also account for \n escape sequences
      const needsRangeFix = /width\s*>=/.test(code)
      const needsNestFix = /\.[^\s{]+(?:\s|\\n)*\{(?:\s|\\n)*@media/.test(code)
      if (!needsRangeFix && !needsNestFix) return null
      return { code: patch(code), map: null }
    },

    generateBundle(_opts, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && typeof asset.source === 'string') {
          asset.source = patch(asset.source)
        }
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL ?? 'http://localhost:3000'
  const port = Number(env.PORT ?? 5173)

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      mediaQueryCompat(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['@imgly/background-removal'],
    },
    server: {
      port,
      strictPort: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: { 'Cross-Origin-Resource-Policy': 'cross-origin' },
        },
      },
    },
  }
})
