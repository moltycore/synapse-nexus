# Welcome to your Lovable project

TODO: Document your project here

### 🤖 Yapay Zeka & Model Bağlam Protokolü (MCP)
*   [Anthropic MCP Servers](https://github.com) — Anthropic tarafından geliştirilen, yapay zeka modellerinin harici veri kaynaklarına, geliştirme araçlarına ve yerel bilgisayar kaynaklarına güvenli bir şekilde bağlanmasını sağlayan resmi Model Context Protocol (MCP) sunucu listesi ve açık kaynak kod deposu.
*
*   Awesome MCP Servers:
*   🔗 https://github.com/modelcontextprotocol/servers

*   

*   ### 🔀 Paralel Ajan Operasyonları (Multi-Agent Swarms)
*   [Parallel Code](https://github.com/johannesjo/parallel-code) — Git Worktrees kullanarak Claude ve Gemini gibi yapay zeka ajanlarını izole ve paralel olarak çalıştıran kodlama orkestratörü.
*   [CrewAI](https://github.com/crewaiinc/crewai) — Rol tabanlı yapay zeka ajanlarını otonom ekipler halinde paralel ve sıralı iş akışlarıyla yöneten güçlü framework.

### 🧠 Gelişmiş Yapay Zeka Hafıza Sistemleri (AI Memory)
*   [Mem0](https://github.com/mem0ai/mem0) — Yapay zeka ajanları için kullanıcı profillerini ve geçmiş tercihlerini akıllıca öğrenen evrensel kalıcı hafıza katmanı.
*   [SimpleMem](https://github.com/aiming-lab/SimpleMem) — Büyük dil modellerinin bağlam sınırına takılmadan ömür boyu ve düşük gecikmeyle hafıza tutmasını sağlayan sistem.
*   

## 🧪 E2E Test Infrastructure & Playwright Status

### Current State
The project has the foundational Playwright infrastructure configured via `playwright.config.ts` and `@playwright/test` dependencies. However, there are **no active end-to-end (E2E) test specs** written yet. The `tests/` or `e2e/` directories are currently missing or empty.

### What Needs to be Tested (Implementation Roadmap)
To make this AI Nexus dashboard production-ready, Gemini/LLMs or contributors should focus on implementing the following test scenarios:

1. **AI Provider API Mocking:** Simulate responses from Anthropic (MCP), OpenAI, and Ollama to test UI resilience against rate limits or invalid API keys.
2. **Asynchronous Agent Streams:** Verify that the UI components dynamically update in real-time when multiple parallel agents are processing tasks concurrently.
3. **State Persistence:** Ensure that workspace memory logs, session histories, and selected model configurations persist accurately across page reloads via LocalStorage.
4. **Core UI Workflows:** Automated flows for inputting system prompts, triggering agent actions, and rendering message threads without DOM blocking.

### How to Run Tests (Once Implemented)
To execute the Playwright test suite locally using Bun, run:
```bash
bunx playwright test
```

